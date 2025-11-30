#!/bin/bash

###############################################################################
# Batch TypeScript Conversion Script for Math.js
#
# This script automates the conversion of JavaScript files to TypeScript using
# jscodeshift codemods with proper error handling and progress tracking.
#
# Usage:
#   ./tools/batch-convert.sh --category arithmetic
#   ./tools/batch-convert.sh --file src/function/arithmetic/add.js
#   ./tools/batch-convert.sh --phase 2
#   ./tools/batch-convert.sh --list files.txt
#
# Options:
#   --category <name>   Convert all files in a category (arithmetic, matrix, etc.)
#   --file <path>       Convert a single file
#   --phase <number>    Convert files for a specific refactoring phase
#   --list <file>       Convert files listed in a text file (one per line)
#   --dry-run          Preview changes without modifying files
#   --skip-tests       Skip running tests after conversion
#   --parallel         Run conversions in parallel (faster, less safe)
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TRANSFORM_SCRIPT="tools/transform-mathjs-to-ts.js"
DRY_RUN=false
SKIP_TESTS=false
PARALLEL=false
CATEGORY=""
FILE=""
PHASE=""
LIST_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --category)
      CATEGORY="$2"
      shift 2
      ;;
    --file)
      FILE="$2"
      shift 2
      ;;
    --phase)
      PHASE="$2"
      shift 2
      ;;
    --list)
      LIST_FILE="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --parallel)
      PARALLEL=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."

  if ! command -v jscodeshift &> /dev/null; then
    log_error "jscodeshift not found. Install with: npm install -g jscodeshift"
    exit 1
  fi

  if [ ! -f "$TRANSFORM_SCRIPT" ]; then
    log_error "Transform script not found: $TRANSFORM_SCRIPT"
    exit 1
  fi

  log_success "Prerequisites satisfied"
}

# Get files to convert based on options
get_files_to_convert() {
  local files=()

  if [ -n "$FILE" ]; then
    # Single file mode
    files=("$FILE")
  elif [ -n "$CATEGORY" ]; then
    # Category mode
    log_info "Finding files in category: $CATEGORY"
    mapfile -t files < <(find "src/function/$CATEGORY" -name "*.js" 2>/dev/null)
  elif [ -n "$PHASE" ]; then
    # Phase mode
    log_info "Finding files for Phase $PHASE"
    case $PHASE in
      2)
        # Phase 2: High-performance functions
        mapfile -t files < <(cat <<EOF
src/function/arithmetic/multiply.js
src/function/arithmetic/divide.js
src/function/matrix/dot.js
src/function/matrix/multiply.js
src/function/algebra/lup.js
src/function/algebra/qr.js
src/function/statistics/mean.js
src/function/statistics/std.js
EOF
)
        ;;
      3)
        # Phase 3: Type system
        mapfile -t files < <(find src/type -name "*.js" 2>/dev/null)
        ;;
      4)
        # Phase 4: Utilities
        mapfile -t files < <(find src/utils -name "*.js" 2>/dev/null)
        ;;
      *)
        log_error "Phase $PHASE not configured"
        exit 1
        ;;
    esac
  elif [ -n "$LIST_FILE" ]; then
    # List file mode
    if [ ! -f "$LIST_FILE" ]; then
      log_error "List file not found: $LIST_FILE"
      exit 1
    fi
    mapfile -t files < "$LIST_FILE"
  else
    log_error "No files specified. Use --category, --file, --phase, or --list"
    exit 1
  fi

  # Filter out already converted files
  local js_files=()
  for file in "${files[@]}"; do
    if [[ "$file" == *.js ]]; then
      js_files+=("$file")
    fi
  done

  if [ ${#js_files[@]} -eq 0 ]; then
    log_warning "No JavaScript files found to convert"
    exit 0
  fi

  echo "${js_files[@]}"
}

# Convert a single file
convert_file() {
  local file=$1
  local ts_file="${file%.js}.ts"

  log_info "Converting: $file"

  # Run jscodeshift
  local transform_args=(
    -t "$TRANSFORM_SCRIPT"
    "$file"
    --extensions=js
    --parser=babel
  )

  if [ "$DRY_RUN" = true ]; then
    transform_args+=(--dry --print)
  fi

  if npx jscodeshift "${transform_args[@]}" > /dev/null 2>&1; then
    if [ "$DRY_RUN" = false ]; then
      # Rename .js to .ts
      if mv "$file" "$ts_file"; then
        log_success "✓ Converted: $file → $ts_file"
        return 0
      else
        log_error "Failed to rename: $file"
        return 1
      fi
    else
      log_info "✓ [DRY RUN] Would convert: $file"
      return 0
    fi
  else
    log_error "✗ Transform failed: $file"
    return 1
  fi
}

# Update factory indexes
update_factory_indexes() {
  local ts_file=$1
  local filename=$(basename "$ts_file" .ts)

  log_info "Updating factory indexes for: $filename"

  # Update factoriesAny.ts
  if grep -q "from.*$filename.js" src/factoriesAny.js 2>/dev/null; then
    sed -i "s/from '\(.*\)$filename\.js'/from '\1$filename.ts'/" src/factoriesAny.js
    log_success "Updated factoriesAny.js"
  fi

  # Update factoriesNumber.js
  if grep -q "from.*$filename.js" src/factoriesNumber.js 2>/dev/null; then
    sed -i "s/from '\(.*\)$filename\.js'/from '\1$filename.ts'/" src/factoriesNumber.js
    log_success "Updated factoriesNumber.js"
  fi
}

# Run tests for converted files
run_tests() {
  local file=$1
  local filename=$(basename "$file" .ts)

  if [ "$SKIP_TESTS" = true ]; then
    log_info "Skipping tests (--skip-tests flag)"
    return 0
  fi

  log_info "Running tests for: $filename"

  # Try to find and run corresponding test
  local test_file="test/unit-tests/function/**/$filename.test.js"
  if compgen -G "$test_file" > /dev/null; then
    if npm test -- --grep "$filename" > /dev/null 2>&1; then
      log_success "✓ Tests passed: $filename"
      return 0
    else
      log_error "✗ Tests failed: $filename"
      return 1
    fi
  else
    log_warning "No test file found for: $filename"
    return 0
  fi
}

# Compile TypeScript
compile_typescript() {
  log_info "Compiling TypeScript..."

  if npm run compile:ts > /dev/null 2>&1; then
    log_success "TypeScript compilation successful"
    return 0
  else
    log_error "TypeScript compilation failed"
    return 1
  fi
}

# Main conversion loop
main() {
  echo ""
  log_info "╔════════════════════════════════════════════════════════════╗"
  log_info "║       Math.js Batch TypeScript Conversion Script          ║"
  log_info "╚════════════════════════════════════════════════════════════╝"
  echo ""

  check_prerequisites

  # Get files to convert
  local files_array=($(get_files_to_convert))
  local total_files=${#files_array[@]}

  log_info "Found $total_files file(s) to convert"
  echo ""

  # Confirmation
  if [ "$DRY_RUN" = false ]; then
    log_warning "This will modify $total_files file(s). Continue? [y/N]"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
      log_info "Aborted by user"
      exit 0
    fi
  fi

  # Statistics
  local success_count=0
  local failure_count=0
  local start_time=$(date +%s)

  # Convert files
  for i in "${!files_array[@]}"; do
    local file="${files_array[$i]}"
    local progress=$((i + 1))

    echo ""
    log_info "──────────────────────────────────────────────────────────"
    log_info "Progress: [$progress/$total_files] Converting: $file"
    log_info "──────────────────────────────────────────────────────────"

    if convert_file "$file"; then
      ((success_count++))

      if [ "$DRY_RUN" = false ]; then
        local ts_file="${file%.js}.ts"
        update_factory_indexes "$ts_file"
        run_tests "$ts_file" || log_warning "Tests failed, but continuing..."
      fi
    else
      ((failure_count++))
    fi
  done

  # Compile TypeScript
  if [ "$DRY_RUN" = false ] && [ $success_count -gt 0 ]; then
    echo ""
    compile_typescript || log_warning "Compilation failed, but conversions completed"
  fi

  # Summary
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))

  echo ""
  log_info "════════════════════════════════════════════════════════════"
  log_info "                    CONVERSION SUMMARY"
  log_info "════════════════════════════════════════════════════════════"
  log_success "Successfully converted: $success_count/$total_files files"
  if [ $failure_count -gt 0 ]; then
    log_error "Failed conversions: $failure_count/$total_files files"
  fi
  log_info "Time elapsed: ${duration}s"
  log_info "════════════════════════════════════════════════════════════"
  echo ""

  if [ $failure_count -gt 0 ]; then
    exit 1
  fi
}

# Run main
main

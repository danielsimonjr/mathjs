//! Sparse matrix ordering algorithms: AMD, RCM, and related utilities.
//!
//! Provides fill-reducing and bandwidth-reducing orderings for sparse
//! matrix factorization. All CSC format with i32 indices, f64 values.

// ============================================
// AMD (Approximate Minimum Degree)
// ============================================

/// AMD ordering: greedy minimum degree heuristic.
/// workPtr needs 2*n i32 space (degree + eliminated).
#[no_mangle]
pub unsafe extern "C" fn amd(
    col_ptr_ptr: *const i32,
    row_idx_ptr: *const i32,
    n: i32,
    perm_ptr: *mut i32,
    work_ptr: *mut i32,
) {
    let n = n as usize;
    if n == 0 {
        return;
    }

    let degree_ptr = work_ptr;
    let eliminated_ptr = work_ptr.add(n);

    // Compute degrees
    for j in 0..n {
        let col_j = *col_ptr_ptr.add(j) as usize;
        let col_j1 = *col_ptr_ptr.add(j + 1) as usize;
        *degree_ptr.add(j) = (col_j1 - col_j) as i32;
        *eliminated_ptr.add(j) = 0;
    }

    for step in 0..n {
        // Find minimum degree node
        let mut min_degree: i32 = (n + 1) as i32;
        let mut min_node: i32 = -1;

        for j in 0..n {
            let elim = *eliminated_ptr.add(j);
            let deg = *degree_ptr.add(j);
            if elim == 0 && deg < min_degree {
                min_degree = deg;
                min_node = j as i32;
            }
        }

        if min_node == -1 {
            break;
        }

        let min_u = min_node as usize;
        *perm_ptr.add(step) = min_node;
        *eliminated_ptr.add(min_u) = 1;

        // Update degrees of neighbors
        let col_min = *col_ptr_ptr.add(min_u) as usize;
        let col_min1 = *col_ptr_ptr.add(min_u + 1) as usize;

        for p in col_min..col_min1 {
            let neighbor = *row_idx_ptr.add(p) as usize;
            if *eliminated_ptr.add(neighbor) == 0 {
                let deg = *degree_ptr.add(neighbor);
                if deg > 0 {
                    *degree_ptr.add(neighbor) = deg - 1;
                }
            }
        }
    }
}

// ============================================
// AMD Aggressive
// ============================================

/// AMD with aggressive absorption. workPtr needs 5*n i32 space.
#[no_mangle]
pub unsafe extern "C" fn amdAggressive(
    col_ptr_ptr: *const i32,
    row_idx_ptr: *const i32,
    n: i32,
    perm_ptr: *mut i32,
    work_ptr: *mut i32,
) {
    let n = n as usize;
    if n == 0 {
        return;
    }

    let degree_ptr = work_ptr;
    let eliminated_ptr = work_ptr.add(n);
    let parent_ptr = work_ptr.add(2 * n);
    let row_degree_ptr = work_ptr.add(3 * n);

    // Initialize
    for j in 0..n {
        let col_j = *col_ptr_ptr.add(j) as usize;
        let col_j1 = *col_ptr_ptr.add(j + 1) as usize;
        *degree_ptr.add(j) = (col_j1 - col_j) as i32;
        *parent_ptr.add(j) = -1;
        *eliminated_ptr.add(j) = 0;
        *row_degree_ptr.add(j) = 0;
    }

    // Count row neighbors for symmetric access
    for j in 0..n {
        let col_j = *col_ptr_ptr.add(j) as usize;
        let col_j1 = *col_ptr_ptr.add(j + 1) as usize;
        for p in col_j..col_j1 {
            let i = *row_idx_ptr.add(p) as usize;
            if i != j {
                let rd = *row_degree_ptr.add(i);
                *row_degree_ptr.add(i) = rd + 1;
            }
        }
    }

    // External degree = col degree + row degree
    for j in 0..n {
        let deg = *degree_ptr.add(j);
        let row_deg = *row_degree_ptr.add(j);
        *degree_ptr.add(j) = deg + row_deg;
    }

    for step in 0..n {
        let mut min_degree: i32 = (2 * n + 1) as i32;
        let mut min_node: i32 = -1;

        for j in 0..n {
            let elim = *eliminated_ptr.add(j);
            let deg = *degree_ptr.add(j);
            if elim == 0 && deg < min_degree {
                min_degree = deg;
                min_node = j as i32;
            }
        }

        if min_node == -1 {
            break;
        }

        let min_u = min_node as usize;
        *perm_ptr.add(step) = min_node;
        *eliminated_ptr.add(min_u) = 1;

        let col_min = *col_ptr_ptr.add(min_u) as usize;
        let col_min1 = *col_ptr_ptr.add(min_u + 1) as usize;

        for p in col_min..col_min1 {
            let neighbor = *row_idx_ptr.add(p) as usize;
            if *eliminated_ptr.add(neighbor) == 0 {
                let deg = *degree_ptr.add(neighbor);
                if deg > 1 {
                    *degree_ptr.add(neighbor) = deg - 1;
                }
                if *parent_ptr.add(neighbor) == -1 {
                    *parent_ptr.add(neighbor) = min_node;
                }
            }
        }

        // Check row neighbors for symmetric pattern
        for j in 0..n {
            if *eliminated_ptr.add(j) == 0 {
                let col_j = *col_ptr_ptr.add(j) as usize;
                let col_j1 = *col_ptr_ptr.add(j + 1) as usize;
                for p in col_j..col_j1 {
                    if *row_idx_ptr.add(p) == min_node {
                        let deg = *degree_ptr.add(j);
                        if deg > 1 {
                            *degree_ptr.add(j) = deg - 1;
                        }
                        break;
                    }
                }
            }
        }
    }
}

// ============================================
// RCM (Reverse Cuthill-McKee)
// ============================================

/// RCM ordering for bandwidth reduction.
/// workPtr needs 4*n i32 space (perm, visited, queue, degree).
#[no_mangle]
pub unsafe extern "C" fn rcm(
    col_ptr_ptr: *const i32,
    row_idx_ptr: *const i32,
    n: i32,
    result_ptr: *mut i32,
    work_ptr: *mut i32,
) {
    let n = n as usize;
    if n == 0 {
        return;
    }

    let perm_ptr = work_ptr;
    let visited_ptr = work_ptr.add(n);
    let queue_ptr = work_ptr.add(2 * n);
    let degree_ptr = work_ptr.add(3 * n);

    // Compute degrees
    for j in 0..n {
        let col_j = *col_ptr_ptr.add(j) as usize;
        let col_j1 = *col_ptr_ptr.add(j + 1) as usize;
        *degree_ptr.add(j) = (col_j1 - col_j) as i32;
        *visited_ptr.add(j) = 0;
    }

    // Find minimum degree starting node
    let mut start_node: usize = 0;
    let mut min_degree = *degree_ptr.add(0);
    for j in 1..n {
        let deg = *degree_ptr.add(j);
        if deg < min_degree {
            min_degree = deg;
            start_node = j;
        }
    }

    let mut front: usize = 0;
    let mut back: usize = 0;
    let mut perm_idx: usize = 0;

    *queue_ptr.add(back) = start_node as i32;
    back += 1;
    *visited_ptr.add(start_node) = 1;

    while front < back {
        let node = *queue_ptr.add(front) as usize;
        front += 1;
        *perm_ptr.add(perm_idx) = node as i32;
        perm_idx += 1;

        let neighbor_start = back;
        let col_node = *col_ptr_ptr.add(node) as usize;
        let col_node1 = *col_ptr_ptr.add(node + 1) as usize;

        for p in col_node..col_node1 {
            let neighbor = *row_idx_ptr.add(p) as usize;
            if *visited_ptr.add(neighbor) == 0 {
                *visited_ptr.add(neighbor) = 1;
                *queue_ptr.add(back) = neighbor as i32;
                back += 1;
            }
        }

        // Check row neighbors for symmetric access
        for j in 0..n {
            if *visited_ptr.add(j) == 0 {
                let col_j = *col_ptr_ptr.add(j) as usize;
                let col_j1 = *col_ptr_ptr.add(j + 1) as usize;
                for p in col_j..col_j1 {
                    if *row_idx_ptr.add(p) as usize == node {
                        *visited_ptr.add(j) = 1;
                        *queue_ptr.add(back) = j as i32;
                        back += 1;
                        break;
                    }
                }
            }
        }

        // Insertion sort neighbors by degree
        let neighbor_start = neighbor_start;
        for i in (neighbor_start + 1)..back {
            let key = *queue_ptr.add(i);
            let key_degree = *degree_ptr.add(key as usize);
            let mut j = i;
            while j > neighbor_start {
                let prev = *queue_ptr.add(j - 1);
                if *degree_ptr.add(prev as usize) > key_degree {
                    *queue_ptr.add(j) = prev;
                    j -= 1;
                } else {
                    break;
                }
            }
            *queue_ptr.add(j) = key;
        }
    }

    // Handle disconnected components
    for j in 0..n {
        if *visited_ptr.add(j) == 0 {
            *perm_ptr.add(perm_idx) = j as i32;
            perm_idx += 1;
        }
    }

    // Reverse into result
    for i in 0..n {
        *result_ptr.add(i) = *perm_ptr.add(n - 1 - i);
    }
}

// ============================================
// INVERSE PERMUTATION
// ============================================

/// Compute inverse permutation.
#[no_mangle]
pub unsafe extern "C" fn inversePerm(perm_ptr: *const i32, n: i32, iperm_ptr: *mut i32) {
    let n = n as usize;
    for i in 0..n {
        let pi = *perm_ptr.add(i) as usize;
        *iperm_ptr.add(pi) = i as i32;
    }
}

// ============================================
// PERMUTE VECTOR
// ============================================

/// Apply permutation to a vector: y[i] = x[perm[i]].
#[no_mangle]
pub unsafe extern "C" fn permuteVector(
    x_ptr: *const f64,
    perm_ptr: *const i32,
    n: i32,
    y_ptr: *mut f64,
) {
    let n = n as usize;
    for i in 0..n {
        let pi = *perm_ptr.add(i) as usize;
        *y_ptr.add(i) = *x_ptr.add(pi);
    }
}

// ============================================
// PERMUTE MATRIX (symmetric P*A*P^T)
// ============================================

/// Permute sparse matrix: C = P*A*P^T.
/// workPtr needs 3*n i32 space (iperm, newColCount, colPos).
#[no_mangle]
pub unsafe extern "C" fn permuteMatrix(
    col_ptr_ptr: *const i32,
    row_idx_ptr: *const i32,
    values_ptr: *const f64,
    perm_ptr: *const i32,
    n: i32,
    _nnz: i32,
    new_col_ptr_ptr: *mut i32,
    new_row_idx_ptr: *mut i32,
    new_values_ptr: *mut f64,
    work_ptr: *mut i32,
) {
    let n = n as usize;

    let iperm_ptr = work_ptr;
    let new_col_count_ptr = work_ptr.add(n);
    let col_pos_ptr = work_ptr.add(2 * n);

    // Compute inverse permutation
    for i in 0..n {
        let pi = *perm_ptr.add(i) as usize;
        *iperm_ptr.add(pi) = i as i32;
    }

    // Count entries per column in permuted matrix
    for j in 0..n {
        let new_j = *iperm_ptr.add(j) as usize;
        let col_j = *col_ptr_ptr.add(j) as usize;
        let col_j1 = *col_ptr_ptr.add(j + 1) as usize;
        *new_col_count_ptr.add(new_j) = (col_j1 - col_j) as i32;
    }

    // Build new column pointers
    *new_col_ptr_ptr.add(0) = 0;
    for j in 0..n {
        let prev = *new_col_ptr_ptr.add(j);
        let count = *new_col_count_ptr.add(j);
        *new_col_ptr_ptr.add(j + 1) = prev + count;
    }

    // Initialize colPos
    for j in 0..n {
        *col_pos_ptr.add(j) = *new_col_ptr_ptr.add(j);
    }

    // Fill new matrix
    for j in 0..n {
        let new_j = *iperm_ptr.add(j) as usize;
        let col_j = *col_ptr_ptr.add(j) as usize;
        let col_j1 = *col_ptr_ptr.add(j + 1) as usize;

        for p in col_j..col_j1 {
            let i = *row_idx_ptr.add(p) as usize;
            let new_i = *iperm_ptr.add(i);
            let pos = *col_pos_ptr.add(new_j) as usize;
            *col_pos_ptr.add(new_j) = (pos + 1) as i32;
            *new_row_idx_ptr.add(pos) = new_i;
            *new_values_ptr.add(pos) = *values_ptr.add(p);
        }
    }
}

// ============================================
// SYMBOLIC CHOLESKY NNZ
// ============================================

/// Estimate fill-in for Cholesky factorization.
/// workPtr needs 3*n i32 space.
#[no_mangle]
pub unsafe extern "C" fn symbolicCholeskyNnz(
    col_ptr_ptr: *const i32,
    row_idx_ptr: *const i32,
    perm_ptr: *const i32,
    n: i32,
    work_ptr: *mut i32,
) -> i32 {
    let n = n as usize;
    if n == 0 {
        return 0;
    }

    let parent_ptr = work_ptr;
    let ancestor_ptr = work_ptr.add(n);
    let iperm_ptr = work_ptr.add(2 * n);

    for i in 0..n {
        *parent_ptr.add(i) = -1;
        *ancestor_ptr.add(i) = -1;
    }

    let use_perm = !perm_ptr.is_null();
    if use_perm {
        for i in 0..n {
            let pi = *perm_ptr.add(i) as usize;
            *iperm_ptr.add(pi) = i as i32;
        }
    }

    for k in 0..n {
        let j = if use_perm {
            *perm_ptr.add(k) as usize
        } else {
            k
        };

        let col_j = *col_ptr_ptr.add(j) as usize;
        let col_j1 = *col_ptr_ptr.add(j + 1) as usize;

        for p in col_j..col_j1 {
            let mut i = *row_idx_ptr.add(p);
            if use_perm {
                i = *iperm_ptr.add(i as usize);
            }

            if (i as usize) < k {
                let mut r = i as usize;
                loop {
                    let anc = *ancestor_ptr.add(r);
                    if anc == -1 || anc == k as i32 {
                        break;
                    }
                    let next = anc as usize;
                    *ancestor_ptr.add(r) = k as i32;
                    r = next;
                }
                *ancestor_ptr.add(r) = k as i32;

                if *parent_ptr.add(r) == -1 {
                    *parent_ptr.add(r) = k as i32;
                }
            }
        }
    }

    // Count nonzeros in L
    let mut nnz: i32 = 0;
    for j in 0..n {
        nnz += 1; // diagonal
        let mut p = *parent_ptr.add(j);
        while p != -1 {
            nnz += 1;
            p = *parent_ptr.add(p as usize);
        }
    }

    nnz
}

// ============================================
// BANDWIDTH
// ============================================

/// Compute bandwidth of matrix under given ordering.
/// workPtr needs n i32 space for iperm.
#[no_mangle]
pub unsafe extern "C" fn bandwidth(
    col_ptr_ptr: *const i32,
    row_idx_ptr: *const i32,
    perm_ptr: *const i32,
    n: i32,
    work_ptr: *mut i32,
) -> i32 {
    let n = n as usize;
    if n == 0 {
        return 0;
    }

    let use_perm = !perm_ptr.is_null();
    let iperm_ptr = work_ptr;

    if use_perm {
        for i in 0..n {
            let pi = *perm_ptr.add(i) as usize;
            *iperm_ptr.add(pi) = i as i32;
        }
    }

    let mut max_bw: i32 = 0;

    for j in 0..n {
        let new_j = if use_perm {
            *iperm_ptr.add(j)
        } else {
            j as i32
        };

        let col_j = *col_ptr_ptr.add(j) as usize;
        let col_j1 = *col_ptr_ptr.add(j + 1) as usize;

        for p in col_j..col_j1 {
            let i = *row_idx_ptr.add(p) as usize;
            let new_i = if use_perm {
                *iperm_ptr.add(i)
            } else {
                i as i32
            };

            let diff = (new_i - new_j).abs();
            if diff > max_bw {
                max_bw = diff;
            }
        }
    }

    max_bw
}

// ============================================
// FIND PERIPHERAL NODE (profile is replaced by this)
// ============================================

/// Find pseudo-peripheral node using BFS.
/// workPtr needs 3*n i32 space (degree, dist, queue).
#[no_mangle]
pub unsafe extern "C" fn profile(
    col_ptr_ptr: *const i32,
    row_idx_ptr: *const i32,
    n: i32,
    work_ptr: *mut i32,
) -> i32 {
    let n = n as usize;
    if n == 0 {
        return 0;
    }

    let degree_ptr = work_ptr;
    let dist_ptr = work_ptr.add(n);
    let queue_ptr = work_ptr.add(2 * n);

    // Compute degrees
    for j in 0..n {
        let col_j = *col_ptr_ptr.add(j) as usize;
        let col_j1 = *col_ptr_ptr.add(j + 1) as usize;
        *degree_ptr.add(j) = (col_j1 - col_j) as i32;
    }

    // Start from minimum degree node
    let mut start_node: usize = 0;
    let mut min_degree = *degree_ptr.add(0);
    for j in 1..n {
        let deg = *degree_ptr.add(j);
        if deg < min_degree {
            min_degree = deg;
            start_node = j;
        }
    }

    // Iterative BFS to find pseudo-peripheral node
    for _iter in 0..5 {
        for j in 0..n {
            *dist_ptr.add(j) = -1;
        }

        let mut front: usize = 0;
        let mut back: usize = 0;
        *queue_ptr.add(back) = start_node as i32;
        back += 1;
        *dist_ptr.add(start_node) = 0;

        let mut far_node = start_node;
        let mut max_dist: i32 = 0;

        while front < back {
            let node = *queue_ptr.add(front) as usize;
            front += 1;

            let col_node = *col_ptr_ptr.add(node) as usize;
            let col_node1 = *col_ptr_ptr.add(node + 1) as usize;
            let dist_node = *dist_ptr.add(node);

            for p in col_node..col_node1 {
                let neighbor = *row_idx_ptr.add(p) as usize;
                if *dist_ptr.add(neighbor) == -1 {
                    let new_dist = dist_node + 1;
                    *dist_ptr.add(neighbor) = new_dist;
                    *queue_ptr.add(back) = neighbor as i32;
                    back += 1;

                    let deg_neigh = *degree_ptr.add(neighbor);
                    let deg_far = *degree_ptr.add(far_node);
                    if new_dist > max_dist || (new_dist == max_dist && deg_neigh < deg_far) {
                        max_dist = new_dist;
                        far_node = neighbor;
                    }
                }
            }
        }

        if far_node == start_node {
            break;
        }
        start_node = far_node;
    }

    start_node as i32
}

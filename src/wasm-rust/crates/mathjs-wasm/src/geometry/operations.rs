//! Geometry operations (ported from src/wasm/geometry/operations.ts)

use libm;

#[no_mangle]
pub unsafe extern "C" fn distance2D(x1: f64, y1: f64, x2: f64, y2: f64) -> f64 {
    let dx = x2 - x1;
    let dy = y2 - y1;
    libm::sqrt(dx * dx + dy * dy)
}

#[no_mangle]
pub unsafe extern "C" fn distance3D(x1: f64, y1: f64, z1: f64, x2: f64, y2: f64, z2: f64) -> f64 {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let dz = z2 - z1;
    libm::sqrt(dx * dx + dy * dy + dz * dz)
}

#[no_mangle]
pub unsafe extern "C" fn distanceND(p1_ptr: *const f64, p2_ptr: *const f64, n: i32) -> f64 {
    let mut sum = 0.0;
    for i in 0..n as usize {
        let d = *p2_ptr.add(i) - *p1_ptr.add(i);
        sum += d * d;
    }
    libm::sqrt(sum)
}

#[no_mangle]
pub unsafe extern "C" fn manhattanDistance2D(x1: f64, y1: f64, x2: f64, y2: f64) -> f64 {
    libm::fabs(x2 - x1) + libm::fabs(y2 - y1)
}

#[no_mangle]
pub unsafe extern "C" fn manhattanDistanceND(
    p1_ptr: *const f64,
    p2_ptr: *const f64,
    n: i32,
) -> f64 {
    let mut sum = 0.0;
    for i in 0..n as usize {
        sum += libm::fabs(*p2_ptr.add(i) - *p1_ptr.add(i));
    }
    sum
}

#[no_mangle]
pub unsafe extern "C" fn intersect2DLines(
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
    x3: f64,
    y3: f64,
    x4: f64,
    y4: f64,
    result_ptr: *mut f64,
) {
    let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if libm::fabs(denom) < 1e-10 {
        *result_ptr = 0.0;
        *result_ptr.add(1) = 0.0;
        *result_ptr.add(2) = 0.0;
        return;
    }
    let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    *result_ptr = x1 + t * (x2 - x1);
    *result_ptr.add(1) = y1 + t * (y2 - y1);
    *result_ptr.add(2) = if t >= 0.0 && t <= 1.0 && u >= 0.0 && u <= 1.0 {
        1.0
    } else {
        0.0
    };
}

#[no_mangle]
pub unsafe extern "C" fn intersect2DInfiniteLines(
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
    x3: f64,
    y3: f64,
    x4: f64,
    y4: f64,
    result_ptr: *mut f64,
) {
    let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if libm::fabs(denom) < 1e-10 {
        *result_ptr = 0.0;
        *result_ptr.add(1) = 0.0;
        *result_ptr.add(2) = 0.0;
        return;
    }
    let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    *result_ptr = x1 + t * (x2 - x1);
    *result_ptr.add(1) = y1 + t * (y2 - y1);
    *result_ptr.add(2) = 1.0;
}

#[no_mangle]
pub unsafe extern "C" fn intersectLinePlane(
    px: f64,
    py: f64,
    pz: f64,
    dx: f64,
    dy: f64,
    dz: f64,
    a: f64,
    b: f64,
    c: f64,
    d: f64,
    result_ptr: *mut f64,
) {
    let denom = a * dx + b * dy + c * dz;
    if libm::fabs(denom) < 1e-10 {
        *result_ptr = 0.0;
        *result_ptr.add(1) = 0.0;
        *result_ptr.add(2) = 0.0;
        *result_ptr.add(3) = 0.0;
        return;
    }
    let t = -(a * px + b * py + c * pz + d) / denom;
    *result_ptr = px + t * dx;
    *result_ptr.add(1) = py + t * dy;
    *result_ptr.add(2) = pz + t * dz;
    *result_ptr.add(3) = 1.0;
}

#[no_mangle]
pub unsafe extern "C" fn cross3D(
    ax: f64,
    ay: f64,
    az: f64,
    bx: f64,
    by: f64,
    bz: f64,
    result_ptr: *mut f64,
) {
    *result_ptr = ay * bz - az * by;
    *result_ptr.add(1) = az * bx - ax * bz;
    *result_ptr.add(2) = ax * by - ay * bx;
}

#[no_mangle]
pub unsafe extern "C" fn dotND(a_ptr: *const f64, b_ptr: *const f64, n: i32) -> f64 {
    let mut sum = 0.0;
    for i in 0..n as usize {
        sum += *a_ptr.add(i) * *b_ptr.add(i);
    }
    sum
}

#[no_mangle]
pub unsafe extern "C" fn angle2D(x1: f64, y1: f64, x2: f64, y2: f64) -> f64 {
    let dot = x1 * x2 + y1 * y2;
    let mag1 = libm::sqrt(x1 * x1 + y1 * y1);
    let mag2 = libm::sqrt(x2 * x2 + y2 * y2);
    if mag1 < 1e-10 || mag2 < 1e-10 {
        return 0.0;
    }
    let mut cos_angle = dot / (mag1 * mag2);
    if cos_angle > 1.0 {
        cos_angle = 1.0;
    }
    if cos_angle < -1.0 {
        cos_angle = -1.0;
    }
    libm::acos(cos_angle)
}

#[no_mangle]
pub unsafe extern "C" fn angle3D(x1: f64, y1: f64, z1: f64, x2: f64, y2: f64, z2: f64) -> f64 {
    let dot = x1 * x2 + y1 * y2 + z1 * z2;
    let mag1 = libm::sqrt(x1 * x1 + y1 * y1 + z1 * z1);
    let mag2 = libm::sqrt(x2 * x2 + y2 * y2 + z2 * z2);
    if mag1 < 1e-10 || mag2 < 1e-10 {
        return 0.0;
    }
    let mut cos_angle = dot / (mag1 * mag2);
    if cos_angle > 1.0 {
        cos_angle = 1.0;
    }
    if cos_angle < -1.0 {
        cos_angle = -1.0;
    }
    libm::acos(cos_angle)
}

#[no_mangle]
pub unsafe extern "C" fn triangleArea2D(
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
    x3: f64,
    y3: f64,
) -> f64 {
    libm::fabs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0)
}

#[no_mangle]
pub unsafe extern "C" fn pointInTriangle2D(
    px: f64,
    py: f64,
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
    x3: f64,
    y3: f64,
) -> f64 {
    let area_orig = triangleArea2D(x1, y1, x2, y2, x3, y3);
    let area1 = triangleArea2D(px, py, x2, y2, x3, y3);
    let area2 = triangleArea2D(x1, y1, px, py, x3, y3);
    let area3 = triangleArea2D(x1, y1, x2, y2, px, py);
    if libm::fabs(area_orig - (area1 + area2 + area3)) < 1e-10 {
        1.0
    } else {
        0.0
    }
}

#[no_mangle]
pub unsafe extern "C" fn normalizeND(v_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    let mut mag = 0.0;
    for i in 0..n as usize {
        let val = *v_ptr.add(i);
        mag += val * val;
    }
    mag = libm::sqrt(mag);
    if mag < 1e-10 {
        for i in 0..n as usize {
            *result_ptr.add(i) = 0.0;
        }
        return;
    }
    for i in 0..n as usize {
        *result_ptr.add(i) = *v_ptr.add(i) / mag;
    }
}

#[no_mangle]
pub unsafe extern "C" fn intersectLineCircle(
    px: f64,
    py: f64,
    dx: f64,
    dy: f64,
    cx: f64,
    cy: f64,
    r: f64,
    result_ptr: *mut f64,
) {
    let ox = px - cx;
    let oy = py - cy;
    let a = dx * dx + dy * dy;
    let b = 2.0 * (ox * dx + oy * dy);
    let c = ox * ox + oy * oy - r * r;
    let discriminant = b * b - 4.0 * a * c;
    if discriminant < 0.0 || a < 1e-14 {
        *result_ptr.add(4) = 0.0;
        return;
    }
    if discriminant < 1e-10 {
        let t = -b / (2.0 * a);
        *result_ptr = px + t * dx;
        *result_ptr.add(1) = py + t * dy;
        *result_ptr.add(4) = 1.0;
        return;
    }
    let sqrt_disc = libm::sqrt(discriminant);
    let t1 = (-b - sqrt_disc) / (2.0 * a);
    let t2 = (-b + sqrt_disc) / (2.0 * a);
    *result_ptr = px + t1 * dx;
    *result_ptr.add(1) = py + t1 * dy;
    *result_ptr.add(2) = px + t2 * dx;
    *result_ptr.add(3) = py + t2 * dy;
    *result_ptr.add(4) = 2.0;
}

#[no_mangle]
pub unsafe extern "C" fn intersectLineSphere(
    px: f64,
    py: f64,
    pz: f64,
    dx: f64,
    dy: f64,
    dz: f64,
    cx: f64,
    cy: f64,
    cz: f64,
    r: f64,
    result_ptr: *mut f64,
) {
    let ox = px - cx;
    let oy = py - cy;
    let oz = pz - cz;
    let a = dx * dx + dy * dy + dz * dz;
    let b = 2.0 * (ox * dx + oy * dy + oz * dz);
    let c = ox * ox + oy * oy + oz * oz - r * r;
    let discriminant = b * b - 4.0 * a * c;
    if discriminant < 0.0 || a < 1e-14 {
        *result_ptr.add(6) = 0.0;
        return;
    }
    if discriminant < 1e-10 {
        let t = -b / (2.0 * a);
        *result_ptr = px + t * dx;
        *result_ptr.add(1) = py + t * dy;
        *result_ptr.add(2) = pz + t * dz;
        *result_ptr.add(6) = 1.0;
        return;
    }
    let sqrt_disc = libm::sqrt(discriminant);
    let t1 = (-b - sqrt_disc) / (2.0 * a);
    let t2 = (-b + sqrt_disc) / (2.0 * a);
    *result_ptr = px + t1 * dx;
    *result_ptr.add(1) = py + t1 * dy;
    *result_ptr.add(2) = pz + t1 * dz;
    *result_ptr.add(3) = px + t2 * dx;
    *result_ptr.add(4) = py + t2 * dy;
    *result_ptr.add(5) = pz + t2 * dz;
    *result_ptr.add(6) = 2.0;
}

#[no_mangle]
pub unsafe extern "C" fn intersectCircles(
    x1: f64,
    y1: f64,
    r1: f64,
    x2: f64,
    y2: f64,
    r2: f64,
    result_ptr: *mut f64,
) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let d = libm::sqrt(dx * dx + dy * dy);
    if d > r1 + r2 || d < libm::fabs(r1 - r2) || d < 1e-14 {
        *result_ptr.add(4) = 0.0;
        return;
    }
    let a = (r1 * r1 - r2 * r2 + d * d) / (2.0 * d);
    let h2 = r1 * r1 - a * a;
    if h2 < 0.0 {
        *result_ptr.add(4) = 0.0;
        return;
    }
    let h = libm::sqrt(h2);
    let px = x1 + (a * dx) / d;
    let py = y1 + (a * dy) / d;
    if h < 1e-10 {
        *result_ptr = px;
        *result_ptr.add(1) = py;
        *result_ptr.add(4) = 1.0;
        return;
    }
    *result_ptr = px + (h * dy) / d;
    *result_ptr.add(1) = py - (h * dx) / d;
    *result_ptr.add(2) = px - (h * dy) / d;
    *result_ptr.add(3) = py + (h * dx) / d;
    *result_ptr.add(4) = 2.0;
}

#[no_mangle]
pub unsafe extern "C" fn projectPointOnLine2D(
    px: f64,
    py: f64,
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
    result_ptr: *mut f64,
) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let len_sq = dx * dx + dy * dy;
    if len_sq < 1e-14 {
        *result_ptr = x1;
        *result_ptr.add(1) = y1;
        *result_ptr.add(2) = 0.0;
        return;
    }
    let t = ((px - x1) * dx + (py - y1) * dy) / len_sq;
    *result_ptr = x1 + t * dx;
    *result_ptr.add(1) = y1 + t * dy;
    *result_ptr.add(2) = t;
}

#[no_mangle]
pub unsafe extern "C" fn distancePointToLine2D(
    px: f64,
    py: f64,
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
) -> f64 {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let len = libm::sqrt(dx * dx + dy * dy);
    if len < 1e-14 {
        return libm::sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }
    libm::fabs((px - x1) * dy - (py - y1) * dx) / len
}

#[no_mangle]
pub unsafe extern "C" fn distancePointToPlane(
    px: f64,
    py: f64,
    pz: f64,
    a: f64,
    b: f64,
    c: f64,
    d: f64,
) -> f64 {
    let norm = libm::sqrt(a * a + b * b + c * c);
    if norm < 1e-14 {
        return 0.0;
    }
    (a * px + b * py + c * pz + d) / norm
}

#[no_mangle]
pub unsafe extern "C" fn polygonCentroid2D(vertices_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    if n < 3 {
        *result_ptr = 0.0;
        *result_ptr.add(1) = 0.0;
        return;
    }
    let mut cx = 0.0;
    let mut cy = 0.0;
    let mut signed_area = 0.0;
    for i in 0..n as usize {
        let j = (i + 1) % n as usize;
        let x0 = *vertices_ptr.add(i * 2);
        let y0 = *vertices_ptr.add(i * 2 + 1);
        let x1 = *vertices_ptr.add(j * 2);
        let y1 = *vertices_ptr.add(j * 2 + 1);
        let a = x0 * y1 - x1 * y0;
        signed_area += a;
        cx += (x0 + x1) * a;
        cy += (y0 + y1) * a;
    }
    signed_area *= 0.5;
    if libm::fabs(signed_area) < 1e-14 {
        let mut sum_x = 0.0;
        let mut sum_y = 0.0;
        for i in 0..n as usize {
            sum_x += *vertices_ptr.add(i * 2);
            sum_y += *vertices_ptr.add(i * 2 + 1);
        }
        *result_ptr = sum_x / n as f64;
        *result_ptr.add(1) = sum_y / n as f64;
        return;
    }
    cx /= 6.0 * signed_area;
    cy /= 6.0 * signed_area;
    *result_ptr = cx;
    *result_ptr.add(1) = cy;
}

#[no_mangle]
pub unsafe extern "C" fn polygonArea2D(vertices_ptr: *const f64, n: i32) -> f64 {
    if n < 3 {
        return 0.0;
    }
    let mut area = 0.0;
    for i in 0..n as usize {
        let j = (i + 1) % n as usize;
        area += *vertices_ptr.add(i * 2) * *vertices_ptr.add(j * 2 + 1);
        area -= *vertices_ptr.add(j * 2) * *vertices_ptr.add(i * 2 + 1);
    }
    libm::fabs(area) / 2.0
}

#[no_mangle]
pub unsafe extern "C" fn pointInConvexPolygon2D(
    px: f64,
    py: f64,
    vertices_ptr: *const f64,
    n: i32,
) -> f64 {
    if n < 3 {
        return 0.0;
    }
    let mut sign = 0i32;
    for i in 0..n as usize {
        let j = (i + 1) % n as usize;
        let x1 = *vertices_ptr.add(i * 2);
        let y1 = *vertices_ptr.add(i * 2 + 1);
        let x2 = *vertices_ptr.add(j * 2);
        let y2 = *vertices_ptr.add(j * 2 + 1);
        let cross = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1);
        if i == 0 {
            sign = if cross >= 0.0 { 1 } else { -1 };
        } else {
            let current_sign = if cross >= 0.0 { 1 } else { -1 };
            if current_sign != sign && libm::fabs(cross) > 1e-10 {
                return 0.0;
            }
        }
    }
    1.0
}

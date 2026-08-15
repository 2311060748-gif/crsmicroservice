# Blueprint API

Danh sách đầy đủ endpoint của cả 3 service. Client ngoài luôn gọi qua Gateway (`http://localhost:8080`)
với tiền tố `/api`; cột "Đường dẫn" bên dưới là đường dẫn **nội tại của service** (sau khi gateway
đã cắt `/api`).

Xem `thiet-ke-bien-gioi-service.md` để hiểu ranh giới dữ liệu giữa các service.

Trạng thái: chỉ `GET /courses` đã code xong. Còn lại là thiết kế.

---

## 1. student-service — port 8081

Base: `http://localhost:8081` — client gọi qua `/api/students`

| Method | Đường dẫn | Mô tả | Mã trả về |
|---|---|---|---|
| GET | `/students` | Lấy danh sách sinh viên | `200` |
| GET | `/students/{id}` | Lấy 1 sinh viên theo id | `200`, `404` |
| POST | `/students` | Thêm sinh viên mới | `201`, `400` |
| PUT | `/students/{id}` | Sửa thông tin sinh viên | `200`, `404` |
| DELETE | `/students/{id}` | Xoá sinh viên | `204`, `404` |

**Cấu trúc sinh viên:**

```json
{
  "id": 1,
  "maSinhVien": "DC20101",
  "hoTen": "Nguyen Van A",
  "email": "a.nguyen@hunre.edu.vn"
}
```

`POST` / `PUT` gửi lên không kèm `id`.

---

## 2. course-service — port 8082

Base: `http://localhost:8082` — client gọi qua `/api/courses`

### 2.1. API công khai

| Method | Đường dẫn | Mô tả | Mã trả về | Trạng thái |
|---|---|---|---|---|
| GET | `/courses` | Lấy danh sách môn học | `200` | **đã code** |
| GET | `/courses/{id}` | Lấy 1 môn theo id | `200`, `404` | dự kiến |
| POST | `/courses` | Thêm môn học mới | `201`, `400` | dự kiến |
| PUT | `/courses/{id}` | Sửa thông tin môn học | `200`, `404` | dự kiến |
| DELETE | `/courses/{id}` | Xoá môn học | `204`, `404`, `409` | dự kiến |

`DELETE` trả `409` nếu môn đó vẫn còn người đăng ký (`soChoDaDangKy > 0`).

**Cấu trúc môn học:**

```json
{
  "id": 1,
  "tenMonHoc": "Lap trinh Java",
  "soTinChi": 3,
  "soChoToiDa": 60,
  "soChoDaDangKy": 12,
  "soChoConLai": 48
}
```

- `soChoDaDangKy`: cột mới cần thêm vào bảng `courses`, mặc định `0`.
- `soChoConLai`: **không lưu trong DB**, tính ra khi trả về (`soChoToiDa - soChoDaDangKy`).

### 2.2. API nội bộ (service-to-service)

Hai endpoint dưới đây **chỉ dành cho registration-service gọi sang**. Gateway không định tuyến
`/internal/**` nên client ngoài không gọi tới được — nếu gọi được thì bất kỳ ai cũng có thể giữ
chỗ tuỳ ý mà không cần đăng ký thật.

#### `POST /internal/courses/{id}/reserve-seat` — giữ 1 chỗ

Tăng `soChoDaDangKy` lên 1, nếu còn chỗ.

| Mã | Khi nào | Ý nghĩa |
|---|---|---|
| `200` | Còn chỗ | Giữ chỗ thành công, đã trừ |
| `409` | `soChoDaDangKy >= soChoToiDa` | Hết chỗ, **không** thay đổi gì |
| `404` | Không có môn với id đó | |

Trả về:

```json
{ "courseId": 1, "soChoConLai": 47 }
```

#### `POST /internal/courses/{id}/release-seat` — trả lại 1 chỗ

Giảm `soChoDaDangKy` đi 1. Dùng khi sinh viên huỷ đăng ký, hoặc khi registration-service cần
hoàn tác lượt giữ chỗ vừa rồi (xem mục "điểm yếu đã biết" trong tài liệu thiết kế).

| Mã | Khi nào | Ý nghĩa |
|---|---|---|
| `200` | Bình thường | Đã trả chỗ |
| `404` | Không có môn với id đó | |

Trả về giống `reserve-seat`.

> **Hai lưu ý về hai API này:**
>
> 1. `release-seat` phải chặn không cho `soChoDaDangKy` xuống dưới `0`. Nếu gọi nhầm hai lần
>    thì lần thứ hai giữ nguyên `0` chứ không thành `-1`.
> 2. Việc kiểm tra "còn chỗ" và trừ chỗ phải nằm trong **cùng một `@Transactional`**. Nếu tách
>    ra thành đọc rồi mới ghi, hai sinh viên bấm đăng ký cùng lúc có thể cùng thấy "còn 1 chỗ"
>    và cùng được nhận — thành ra vượt quá `soChoToiDa`.

---

## 3. registration-service — port 8083

Base: `http://localhost:8083` — client gọi qua `/api/registrations`

| Method | Đường dẫn | Mô tả | Mã trả về |
|---|---|---|---|
| GET | `/registrations` | Lấy tất cả lượt đăng ký | `200` |
| GET | `/registrations/{id}` | Lấy 1 lượt đăng ký | `200`, `404` |
| GET | `/registrations/student/{studentId}` | Các môn 1 sinh viên đã đăng ký | `200` |
| GET | `/registrations/course/{courseId}` | Các sinh viên đã đăng ký 1 môn | `200` |
| POST | `/registrations` | Đăng ký học phần | `201`, `404`, `409` |
| DELETE | `/registrations/{id}` | Huỷ đăng ký | `204`, `404` |

**Cấu trúc lượt đăng ký:**

```json
{
  "id": 1,
  "studentId": 1,
  "courseId": 2,
  "ngayDangKy": "2026-08-03T09:30:00",
  "trangThai": "DA_DANG_KY"
}
```

`trangThai`: `DA_DANG_KY` hoặc `DA_HUY`.

**Body gửi lên khi `POST`:**

```json
{ "studentId": 1, "courseId": 2 }
```

### Ý nghĩa mã lỗi của `POST /registrations`

| Mã | Nguyên nhân |
|---|---|
| `404` | Không tồn tại sinh viên hoặc môn học với id đã gửi |
| `409` | Môn đã hết chỗ, **hoặc** sinh viên này đã đăng ký môn đó rồi |

---

## 4. Bảng tổng hợp

| Service | Port | Số endpoint công khai | API nội bộ |
|---|---|---|---|
| student-service | 8081 | 5 | không |
| course-service | 8082 | 5 | 2 (`reserve-seat`, `release-seat`) |
| registration-service | 8083 | 6 | không |

Tổng cộng: **16 endpoint công khai + 2 endpoint nội bộ**.

---

## 5. Quy ước chung

- Tất cả request/response dùng `Content-Type: application/json`.
- Mã trạng thái theo chuẩn REST: `200` đọc/sửa OK, `201` tạo mới, `204` xoá xong không trả nội dung,
  `400` body sai, `404` không tìm thấy, `409` xung đột nghiệp vụ (hết chỗ, trùng đăng ký).
- Tên trường trong JSON dùng tiếng Việt không dấu, kiểu camelCase (`tenMonHoc`, `soChoToiDa`) —
  giữ nhất quán với `Course` entity đang có.
- Cột trong DB dùng snake_case (`ten_mon_hoc`, `so_cho_toi_da`), ánh xạ bằng `@Column(name = ...)`.

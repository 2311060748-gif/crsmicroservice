# Thiết kế biên giới service

Tài liệu này chốt **ranh giới trách nhiệm** giữa các thành phần trước khi code, để mỗi service
biết rõ mình sở hữu dữ liệu nào và không được đụng vào cái gì.

Trạng thái: `course-service` đã chạy được (`GET /courses`, port 8082). Ba thành phần còn lại là
**dự kiến** cho các buổi sau.

---

## 1. Bốn thành phần

### 1.1. API Gateway — port `8080`

| Mục | Nội dung |
|---|---|
| Trách nhiệm | Cửa ngõ duy nhất cho client. Nhận request từ ngoài, định tuyến tới service phía sau. |
| Sở hữu dữ liệu | **Không có DB.** Hoàn toàn stateless. |
| Không được làm | Không chứa logic nghiệp vụ, không tự truy vấn DB của service nào. |

Đây là thành phần duy nhất client (Postman, trình duyệt) gọi trực tiếp. Ba service còn lại
nằm sau gateway.

### 1.2. student-service — port `8081`

| Mục | Nội dung |
|---|---|
| Trách nhiệm | Quản lý hồ sơ sinh viên. |
| Sở hữu dữ liệu | DB `student_db`, bảng `students` (`id`, `maSinhVien`, `hoTen`, `email`). |
| Không được làm | Không biết gì về môn học hay lượt đăng ký. |

### 1.3. course-service — port `8082` *(đã có)*

| Mục | Nội dung |
|---|---|
| Trách nhiệm | Quản lý môn học và **số chỗ còn lại** của từng môn. |
| Sở hữu dữ liệu | DB `course_db`, bảng `courses` (`id`, `tenMonHoc`, `soTinChi`, `soChoToiDa`). |
| Không được làm | Không lưu ai đã đăng ký môn nào — đó là việc của registration-service. |

Service này là **chủ sở hữu duy nhất của số chỗ**. Không service nào khác được tự cộng/trừ chỗ;
muốn giữ chỗ phải gọi API nội bộ `reserve-seat` / `release-seat` (xem `blueprint-api.md`).

> **Cần bổ sung:** bảng `courses` hiện chỉ có `soChoToiDa`. Để đếm chỗ còn trống phải thêm cột
> `so_cho_da_dang_ky` (mặc định 0). Chỗ còn lại = `soChoToiDa - soChoDaDangKy`.

### 1.4. registration-service — port `8083`

| Mục | Nội dung |
|---|---|
| Trách nhiệm | Xử lý việc sinh viên đăng ký / huỷ đăng ký học phần. |
| Sở hữu dữ liệu | DB `registration_db`, bảng `registrations` (`id`, `studentId`, `courseId`, `ngayDangKy`, `trangThai`). |
| Không được làm | Không tự sửa số chỗ trong `course_db`, không lưu bản sao hồ sơ sinh viên. |

Đây là service duy nhất gọi sang service khác. Nó lưu `studentId` và `courseId` dưới dạng
**số tham chiếu**, không phải khoá ngoại — vì hai bảng kia nằm ở DB khác.

---

## 2. Nguyên tắc DB riêng (database per service)

Mỗi service một schema riêng, một tài khoản MySQL riêng:

| Service | Database | Bảng chính |
|---|---|---|
| student-service | `student_db` | `students` |
| course-service | `course_db` | `courses` |
| registration-service | `registration_db` | `registrations` |

Ba quy tắc bắt buộc:

1. **Không service nào đọc/ghi DB của service khác.** Cần dữ liệu thì gọi API, không mở kết nối JDBC sang schema kia.
2. **Không JOIN chéo database.** Muốn hiển thị "sinh viên A đã đăng ký môn B" thì registration-service
   gọi student-service lấy tên, gọi course-service lấy tên môn, rồi ghép ở tầng ứng dụng.
3. **Không dùng khoá ngoại (FOREIGN KEY) trỏ sang bảng của service khác.** Ràng buộc toàn vẹn
   được kiểm tra bằng lời gọi API, không phải bằng constraint của MySQL.

Lý do phải tách: nếu ba service dùng chung một schema thì chỉ cần một service đổi cấu trúc bảng
là hai service kia gãy — lúc đó không còn là microservices nữa, mà là một khối liền chia làm ba
tiến trình.

---

## 3. Bảng định tuyến Gateway (dự kiến)

Client chỉ gọi `http://localhost:8080`. Gateway ánh xạ như sau:

| # | Đường dẫn client gọi | Chuyển tới service | Địa chỉ đích |
|---|---|---|---|
| 1 | `/api/students/**` | student-service | `http://localhost:8081` |
| 2 | `/api/courses/**` | course-service | `http://localhost:8082` |
| 3 | `/api/registrations/**` | registration-service | `http://localhost:8083` |
| 4 | `/internal/**` | *(không định tuyến)* | — |

Ghi chú quan trọng:

- **Dòng 4 là có chủ đích.** Các API nội bộ (`reserve-seat`, `release-seat`) **không** được khai
  báo route ở gateway. Chúng chỉ dành cho service gọi service. Nếu client ngoài gọi được
  `reserve-seat` thì có thể giữ chỗ tuỳ ý mà không cần đăng ký, làm hỏng số liệu chỗ trống.
- Gateway cắt tiền tố `/api` trước khi chuyển tiếp. Ví dụ client gọi
  `GET /api/courses` → gateway gọi `GET http://localhost:8082/courses`.
- Cổng của từng service đọc từ file `.env` (biến `SERVER_PORT`), không hardcode.

Ví dụ đường đi đầy đủ của một request:

```
Postman
  → GET http://localhost:8080/api/courses      (Gateway, 8080)
    → GET http://localhost:8082/courses        (course-service, 8082)
      → SELECT * FROM courses                  (MySQL, course_db)
```

---

## 4. Giao tiếp giữa các service

Chỉ có **một** đường gọi chéo trong hệ thống này: registration-service → course-service.

```
[registration-service]  --POST /internal/courses/{id}/reserve-seat-->  [course-service]
                        <--200 OK còn chỗ / 409 hết chỗ-------------
```

Luồng đăng ký học phần:

1. Client gọi `POST /api/registrations` qua gateway.
2. registration-service gọi `reserve-seat` sang course-service để giữ chỗ.
3. Nếu course-service trả `409` (hết chỗ) → registration-service trả lỗi về client, **không lưu gì cả**.
4. Nếu trả `200` → registration-service lưu bản ghi đăng ký rồi trả `201` về client.

Luồng huỷ đăng ký thì ngược lại: xoá bản ghi trước, rồi gọi `release-seat` để trả chỗ.

> **Điểm yếu đã biết:** ở bước 4, nếu giữ chỗ xong mà lưu DB thất bại thì chỗ đó bị "treo" —
> đã trừ nhưng không ai dùng. Cách xử lý đơn giản cho bài tập: bắt lỗi khi lưu và gọi
> `release-seat` để hoàn lại. Đây chính là vấn đề giao dịch phân tán, sẽ học kỹ hơn ở buổi sau.

---

## 5. Tóm tắt

| Thành phần | Port | Database | Gọi sang service khác? |
|---|---|---|---|
| api-gateway | 8080 | không có | có (định tuyến tất cả) |
| student-service | 8081 | `student_db` | không |
| course-service | 8082 | `course_db` | không |
| registration-service | 8083 | `registration_db` | có (→ course-service) |

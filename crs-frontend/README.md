# CRS Frontend

Frontend React + TypeScript của Course Registration System. Mọi API request từ frontend đi qua API Gateway; frontend không gọi trực tiếp các service nghiệp vụ.

## Công nghệ

- React 19
- TypeScript
- Vite
- Axios
- pnpm

## Khởi chạy

Yêu cầu API Gateway đang chạy tại `http://localhost:8080`.

```powershell
pnpm install
pnpm dev
```

Mở `http://localhost:5173`. Vite proxy `/api/**` tới API Gateway, nên request `/api/courses` từ trình duyệt sẽ được chuyển tới `http://localhost:8080/api/courses`.

Có thể đặt `VITE_API_BASE_URL` nếu cần dùng một Gateway URL khác. Khi không khai báo, Axios sử dụng `/api`.

## Scripts

```powershell
pnpm dev      # Chạy development server
pnpm lint     # Kiểm tra ESLint
pnpm build    # Type-check và build production
pnpm preview  # Xem thử production build
```

## Cấu trúc chính

```text
src/
├── api/       # Axios client
├── types/     # TypeScript contracts khớp DTO backend
├── App.tsx    # Kiểm tra kết nối Gateway hiện tại
└── main.tsx   # React entry point
```

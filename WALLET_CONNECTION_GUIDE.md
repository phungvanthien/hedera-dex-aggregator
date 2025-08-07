# Hướng dẫn kết nối ví

## Vấn đề đã được khắc phục

### Vấn đề trước đây:
- Khi nhấn "Connect Wallet", MetaMask extension mở ra nhưng không trở về trang web
- Không có tùy chọn chọn loại ví

### Giải pháp đã áp dụng:

#### 1. **Cải thiện logic kết nối**
- Ưu tiên HashPack (ví native cho Hedera)
- Chỉ sử dụng EVM wallet khi HashPack không khả dụng
- Xử lý lỗi tốt hơn

#### 2. **Tạo Wallet Selector**
- Dialog cho phép chọn loại ví
- Tùy chọn HashPack (khuyến nghị)
- Tùy chọn MetaMask/EVM wallet

## Cách sử dụng mới:

### **Bước 1: Nhấn "Connect Wallet"**
- Sẽ mở dialog chọn loại ví

### **Bước 2: Chọn loại ví**

#### **Option A: HashPack (Khuyến nghị)**
- Nhấn "HashPack" 
- QR code sẽ xuất hiện
- Quét bằng HashPack app trên điện thoại
- Kết nối thành công

#### **Option B: MetaMask/EVM**
- Nhấn "MetaMask / EVM"
- MetaMask extension sẽ mở
- Chấp nhận kết nối
- Chuyển sang Hedera Mainnet

### **Bước 3: Xác nhận kết nối**
- Sau khi kết nối thành công, bạn sẽ thấy:
  - Địa chỉ ví hiển thị
  - Số dư HBAR
  - Có thể truy cập các tính năng trading

## Lưu ý quan trọng:

### **HashPack (Khuyến nghị)**
- ✅ Tối ưu cho Hedera
- ✅ Không cần extension
- ✅ Trải nghiệm mượt mà
- ✅ Hỗ trợ đầy đủ tính năng Hedera

### **MetaMask/EVM**
- ⚠️ Cần cài đặt MetaMask
- ⚠️ Có thể gặp vấn đề với extension
- ⚠️ Hỗ trợ hạn chế một số tính năng Hedera

## Troubleshooting:

### **Nếu HashPack không hoạt động:**
1. Đảm bảo đã cài HashPack app
2. Kiểm tra kết nối internet
3. Thử lại sau vài giây

### **Nếu MetaMask không hoạt động:**
1. Đảm bảo MetaMask đã cài đặt
2. Kiểm tra MetaMask đã unlock
3. Chấp nhận kết nối trong MetaMask

### **Nếu không kết nối được:**
1. Refresh trang web
2. Kiểm tra console để xem lỗi
3. Thử loại ví khác 
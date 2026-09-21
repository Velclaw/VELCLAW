> ## Mục lục tài liệu
> Xem toàn bộ mục lục tài liệu tại: https://docs.devin.ai/llms.txt
Hãy sử dụng tệp này để khám phá tất cả các trang có sẵn trước khi tìm hiểu thêm.

# Bản thiết kế môi trường Devin

> Bản thiết kế mô tả môi trường của Devin; Devin có thể tạo chúng từ kho lưu trữ của bạn, và bạn có thể xem xét hoặc chỉnh sửa chúng trước khi quá trình xây dựng tạo ra các bản chụp nhanh.

## Bắt đầu

<Thông tin>
  **Điều kiện tiên quyết**: Devin phải có quyền truy cập vào kho lưu trữ của bạn trước khi bạn có thể cấu hình môi trường của nó. Nếu bạn chưa thiết lập tích hợp Git, hãy xem [Trước khi bắt đầu](/onboard-devin/environment#before-you-start) để biết các bước thiết lập. Người dùng doanh nghiệp cũng cần cấp quyền truy cập cho từng tổ chức vào kho lưu trữ của mình trong **Cài đặt doanh nghiệp > Quyền truy cập kho lưu trữ**.
</Thông tin>

Bản thiết kế là định dạng mà Devin sử dụng để mô tả một môi trường: các công cụ cần cài đặt, các phụ thuộc cần duy trì và các lệnh mà môi trường đó cần biết. Devin có thể tạo bản thiết kế từ kho lưu trữ của bạn, và bạn có thể xem xét hoặc chỉnh sửa nó bất cứ khi nào bạn muốn kiểm soát nhiều hơn quá trình thiết lập.

<Tabs>
  <Tab title="Hãy để Devin làm việc đó (khuyến nghị)">
    Phù hợp nhất với hầu hết người dùng. Devin sẽ kiểm tra kho lưu trữ của bạn, tìm ra các công cụ, môi trường chạy và các phụ thuộc cần thiết, rồi tạo ra bản thiết kế cho bạn. Bạn sẽ xem xét và phê duyệt cấu hình được đề xuất trước khi tiến hành biên dịch.

    <Các bước>
      <Tiêu đề bước="Bắt đầu một phiên Devin">
        Mở một phiên làm việc mới và yêu cầu Devin cấu hình kho lưu trữ. Ví dụ: *"Thiết lập môi trường của bạn cho kho lưu trữ này."*
      </Bước>

      <Tiêu đề bước="Xem xét và phê duyệt">
        Devin đề xuất một bản kế hoạch dựa trên những gì nó tìm thấy. Bạn sẽ thấy **thẻ đề xuất** trong dòng thời gian của mình. Xem xét các công cụ, phụ thuộc và lệnh được đề xuất, sau đó nhấp vào **Phê duyệt**.
      </Bước>

      <Tiêu đề bước="Xây dựng và xác minh">
        Sau khi bạn chấp thuận các đề xuất, quá trình biên dịch sẽ chạy và tạo ra một bản sao lưu. Hãy bắt đầu một phiên làm việc mới để khởi động từ bản sao lưu đó, sau đó yêu cầu Devin chạy các lệnh kiểm tra mã hoặc kiểm thử của bạn để xác nhận mọi thứ hoạt động bình thường.
      </Bước>
    </Các bước>

    Xem [video hướng dẫn thiết lập một lần và tổng quan](/onboard-devin/environment#set-it-up-by-asking-devin) trên trung tâm Môi trường.
  </Tab>

  <Tiêu đề tab="Thiết lập thủ công">
    Phương pháp này hiệu quả nhất khi bạn biết chính xác môi trường của mình cần gì, hoặc muốn kiểm soát hoàn toàn mọi bước. Nó cũng nhanh hơn nếu bạn đã chuẩn bị sẵn các lệnh.

    <Các bước>
      <Tiêu đề bước="Điều hướng đến cấu hình môi trường">
        Vào **Cài đặt > Môi trường > Bản thiết kế** trong thanh bên của tổ chức bạn.

        Nếu bạn không thấy tùy chọn này, hãy liên hệ với quản trị viên doanh nghiệp của bạn để xác nhận rằng bản thiết kế môi trường đã được bật cho tổ chức của bạn.
      </Bước>

      <Tiêu đề bước="Thêm kho lưu trữ">
        Nhấp vào **Thêm** trong phần Kho lưu trữ. Chọn các kho lưu trữ bạn muốn Devin làm việc cùng, sau đó xác nhận.

        Các kho lưu trữ được thêm vào đây sẽ được sao chép vào môi trường của Devin trong mỗi lần xây dựng. Bạn có thể thêm nhiều kho lưu trữ hơn bất cứ lúc nào.
      </Bước>

      <Tiêu đề bước="Viết bản kế hoạch của bạn">
        Nhấp chuột vào kho lưu trữ để mở trình chỉnh sửa bản thiết kế của nó. Đây là một ví dụ đơn giản:

        ```yaml theme={null}
        Khởi tạo: |
          curl -LsSf https://astral.sh/uv/install.sh | sh

        bảo trì: |
          đồng bộ tia cực tím

        kiến thức:
          - tên: lint
            Nội dung: Kiểm tra độ bền màu UV.
          - tên: kiểm tra
            nội dung: uv run pytest
        ```

        Để biết thêm ngôn ngữ và mẫu, hãy xem [Thư viện mẫu](/onboard-devin/environment/templates).
      </Bước>

      <Tiêu đề bước="Lưu và xây dựng">
        Nhấp vào **Lưu**. Quá trình biên dịch sẽ bắt đầu tự động. Thời gian biên dịch phụ thuộc vào số lượng kho lưu trữ bạn đã cấu hình và khối lượng công việc mà các bản thiết kế của bạn thực hiện, vì vậy hãy theo dõi tiến độ từ **Cài đặt > Môi trường > Ảnh chụp nhanh** trong mục **Bản biên dịch hiện tại**.
      </Bước>

      <Tiêu đề bước="Xác minh">
        Sau khi quá trình biên dịch hiển thị **Thành công**, hãy bắt đầu một phiên Devin mới. Devin sẽ khởi động từ ảnh chụp nhanh mới với mọi thứ đã được cấu hình sẵn. Hãy thử yêu cầu Devin chạy các lệnh lint hoặc test của bạn để xác minh môi trường hoạt động bình thường.
      </Bước>
    </Các bước>
  </Tab>
</Tabs>

Phần còn lại của hướng dẫn này giải thích cách thức hoạt động của bản thiết kế được tạo ra và cách chỉnh sửa nó khi bạn muốn kiểm soát nhiều hơn.

<Card title="Xem cách áp dụng từ đầu đến cuối" icon="chart-line" href="/onboard-devin/environment/scenarios" horizontal>
  **Các tình huống: phát triển cùng ACME Corp** — từ một kho lưu trữ ban đầu, sau đó là nhiều kho lưu trữ với các phụ thuộc chung, rồi đến nhiều tổ chức khác nhau. Đã xây dựng các bản thiết kế chi tiết cho từng giai đoạn, và cách quyết định xem một thành phần nào đó thuộc cấp độ nào.
</Card>

## Cách thức hoạt động

Cấu hình khai báo sử dụng ba khái niệm:

| Khái niệm | Nó là gì | Phép so sánh |
| ------------- | ------------------------------------------------------------------------------------------------------ | -------------- |
| **Bản thiết kế** | Một tệp cấu hình YAML mô tả những gì cần cài đặt và cách thiết lập môi trường của Devin | Dockerfile |
| **Xây dựng** | Quá trình chạy bản thiết kế của bạn, sao chép kho lưu trữ và tạo ảnh chụp nhanh | `docker build` |
| **Ảnh chụp nhanh** | Một ảnh Docker cố định, có thể khởi động được, của môi trường mà các phiên bắt đầu từ đó | Ảnh Docker |

**Bản thiết kế mô tả những gì bạn muốn.** Bạn tạo và chỉnh sửa chúng trong giao diện Cài đặt.

**Quá trình biên dịch chạy các bản thiết kế của bạn để tạo ra các bản chụp nhanh.** Quá trình biên dịch chạy tự động khi bạn lưu bản thiết kế và định kỳ (~mỗi 24 giờ) để cập nhật các thư viện phụ thuộc.

**Ảnh chụp nhanh là nơi các phiên khởi động.** Mỗi tổ chức có một ảnh chụp nhanh đang hoạt động. Mỗi phiên khởi động một bản sao mới. Các thay đổi trong phiên không được lưu lại vào ảnh chụp nhanh.

### Các phần của bản vẽ thiết kế

Một bản thiết kế có ba phần cốt lõi, cộng thêm một khối `sau khi xây dựng` dành cho các bản thiết kế cấp tổ chức/doanh nghiệp và một khối `sao chép` tùy chọn dành cho các bản thiết kế cấp kho lưu trữ:

| Phần | Mục đích | Thời gian chạy |
| ------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `khởi tạo` | Cài đặt các công cụ, môi trường chạy, gói hệ thống | Chỉ trong quá trình biên dịch. Kết quả được lưu trong ảnh chụp nhanh. |
| `bảo trì` | Cài đặt/cập nhật các phụ thuộc của dự án, ghi cấu hình thông tin xác thực | Trong quá trình xây dựng. Được hiển thị cho tác nhân khi bắt đầu phiên (không tự động thực thi). |
| `kiến thức` | Thông tin tham khảo cho Devin (lệnh lint, test, build) | Không được thực thi. Được tải vào ngữ cảnh của Devin khi bắt đầu phiên. |
| `sau khi biên dịch` | Xác thực môi trường đã được lắp ráp hoàn chỉnh (chỉ dành cho tổ chức/doanh nghiệp) | Trong quá trình biên dịch, sau khi tất cả các kho lưu trữ đã được sao chép và thiết lập. Lỗi thoát với mã khác 0 sẽ khiến quá trình biên dịch thất bại. |
| `clone` | Ghi đè các thiết lập mặc định của git-clone cho kho lưu trữ (chỉ ở cấp độ kho lưu trữ) | Được áp dụng trong bước sao chép của quá trình xây dựng. |

**`initialize`** dùng cho những việc chỉ cần thực hiện một lần: môi trường chạy ngôn ngữ, gói hệ thống, công cụ CLI toàn cục.

**`maintenance`** dùng để cài đặt các thư viện phụ thuộc cần được cập nhật. Nó chạy trong quá trình xây dựng và được hiển thị cho tác nhân khi bắt đầu phiên để có thể chạy lại nếu các thư viện phụ thuộc đã thay đổi (ví dụ: sau khi tải mã mới nhất). Các lệnh không được tự động thực thi khi bắt đầu phiên, nhưng vẫn phải nhanh và có tính chất tăng dần (sử dụng `npm install`, không phải `npm ci`).

**`kiến thức`** là thông tin tham khảo, không phải thông tin có thể thực thi. Đây là cách bạn cho Devin biết các lệnh chính xác để kiểm tra cú pháp, kiểm thử và biên dịch. Hãy giữ cho các mục ngắn gọn và tập trung vào các lệnh có thể thực thi.

**`post-build`** (chỉ dành cho cấp độ tổ chức và doanh nghiệp) chạy sau khi mọi kho lưu trữ đã được sao chép và thiết lập, ngay trước khi ảnh chụp nhanh được lưu. Sử dụng nó để xác minh môi trường đã được lắp ráp — ví dụ: kiểm tra xem các công cụ cần thiết đã được cài đặt hay chưa hoặc kiểm tra nhanh giữa các kho lưu trữ có thành công hay không. Mã thoát khác 0 sẽ khiến quá trình xây dựng thất bại, vì vậy không có ảnh chụp nhanh nào được xuất xưởng nếu chưa vượt qua các kiểm tra của bạn. Xem [Tham chiếu Blueprint → post-build](/onboard-devin/environment/blueprint-reference#post-build).

**`clone`** (chỉ ở cấp độ kho lưu trữ) ghi đè các thiết lập mặc định mà Devin sử dụng khi sao chép kho lưu trữ vào ảnh chụp nhanh — ví dụ: kiểm tra một nhánh không mặc định (`ref`), thay đổi đích sao chép (`path`) hoặc bỏ qua các mô-đun con hoặc đối tượng LFS. Mọi trường đều là tùy chọn. Xem [Tham chiếu Blueprint → clone](/onboard-devin/environment/blueprint-reference#clone) để biết danh sách đầy đủ các trường.

<Thông tin>
  **Sự khác biệt giữa mục "Kiến thức" và tính năng "Kiến thức" trong bản thiết kế:** Mục "Kiến thức" trong bản thiết kế của bạn dùng để tham khảo các lệnh ngắn gọn liên quan đến môi trường. Đối với tài liệu kiến trúc, quy ước và quy trình làm việc nhóm, hãy sử dụng tính năng "[Kiến thức](/product-guides/knowledge)" riêng biệt.
</Thông tin>

<Thông tin>
  **YAML đa tài liệu:** Trình chỉnh sửa bản thiết kế hỗ trợ YAML đa tài liệu bằng cách sử dụng dấu phân cách `---`. Điều này cho phép bạn sắp xếp các bản thiết kế phức tạp thành các phần hợp lý trong cùng một trình chỉnh sửa.
</Thông tin>

Để biết thông số kỹ thuật đầy đủ của trường (các loại bước, biến môi trường, bí mật và tệp đính kèm), hãy xem [Tham chiếu Blueprint](/onboard-devin/environment/blueprint-reference).

### Phạm vi bản thiết kế

Bạn có thể định nghĩa bản thiết kế ở hai cấp độ:

| Cấp độ | Nơi cấu hình | Nội dung cần điền vào đây |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Tổ chức** | Cài đặt > Môi trường > Bản thiết kế > Thiết lập toàn tổ chức | Công cụ được chia sẻ trên tất cả các kho lưu trữ: môi trường chạy ngôn ngữ, trình quản lý gói, xác thực Docker |
| **Kho lưu trữ** | Cài đặt > Môi trường > Bản thiết kế > \[tên kho lưu trữ] | Thiết lập dành riêng cho dự án: `npm install`, các lệnh lint/test/build |

Các bản thiết kế có tính chất **bổ sung**: các bản thiết kế kho lưu trữ được xây dựng dựa trên bản thiết kế tổ chức. Chức năng `bảo trì` của một kho lưu trữ có thể sử dụng các công cụ được cài đặt bởi chức năng `khởi tạo` của tổ chức. Nếu chỉ một kho lưu trữ cần một công cụ, hãy đặt nó vào bản thiết kế của kho lưu trữ đó. Nếu mọi kho lưu trữ đều cần nó, hãy đặt nó vào bản thiết kế tổ chức.

Đối với monorepos, một kho lưu trữ có thể có một bản thiết kế gốc cộng với các bản thiết kế không gian làm việc cho mỗi thư mục con, mỗi bản thiết kế đều có các phần `initialize`, `maintenance` và `knowledge` riêng cùng với thư mục làm việc của nó. Xem [Không gian làm việc và monorepos](/onboard-devin/environment/workspaces) để biết hướng dẫn thiết lập và ví dụ.

Để xem các ví dụ minh họa về việc lựa chọn cấp độ khi cơ sở mã phát triển, hãy xem [Kịch bản: phát triển cùng ACME Corp](/onboard-devin/environment/scenarios).

<Thông tin>
  **Người dùng doanh nghiệp:** Có một cấp độ thứ ba, đó là bản thiết kế doanh nghiệp, áp dụng cho tất cả các tổ chức. Xem [Tổng quan về môi trường doanh nghiệp](/enterprise/environment-management/overview) để biết thêm chi tiết.
</Thông tin>

## Bản dựng và phiên

### Ảnh chụp nhanh

Tổ chức của bạn có **một ảnh chụp nhanh đang hoạt động**: một ảnh máy ảo với các công cụ, kho lưu trữ và các thành phần phụ thuộc đã được cài đặt sẵn. Tất cả các kho lưu trữ đã được cấu hình đều được sao chép và thiết lập trong ảnh duy nhất đó. Mỗi phiên làm việc đều khởi động từ một bản sao mới.

### Cách thức hoạt động của các bản dựng

Quá trình xây dựng tạo ra một bản chụp nhanh mới bằng cách chạy các bản thiết kế của bạn theo trình tự:

```
1. Bản thiết kế doanh nghiệp, nếu được cấu hình (chạy trong ~):
   a. Khởi tạo
   b. bảo trì
2. Sơ đồ tổ chức (chạy trong ~):
   a. Khởi tạo
   b. bảo trì
3. Sao chép tất cả các kho lưu trữ (tối đa 10 kho đồng thời).
   Mỗi bản thiết kế của kho lưu trữ có thể ghi đè các thiết lập mặc định của bản sao thông qua...
   Khối `clone` (nhánh/thẻ, độ sâu, mô-đun con, LFS, v.v.).
4. Đối với mỗi kho lưu trữ đã được cấu hình, theo thứ tự được hiển thị trong Cài đặt
   (chạy trong ~/repos/<tên kho lưu trữ>):
   a. Khởi tạo
   b. bảo trì
5. Các bước sau khi xây dựng (trước tiên là bản thiết kế của tổ chức, sau đó là của doanh nghiệp; chạy trong ~)
6. Kiểm tra sức khỏe, sau đó lưu ảnh chụp màn hình.
```

Các lớp có tính chất **cộng dồn**: các lệnh dành riêng cho kho lưu trữ có thể sử dụng các công cụ được cài đặt bởi tổ chức hoặc bản thiết kế doanh nghiệp. Các lớp thấp hơn không thể ghi đè lên thiết lập ở cấp cao hơn. Thời gian xây dựng tỷ lệ thuận với số lượng kho lưu trữ được cấu hình và khối lượng công việc mà bản thiết kế của bạn thực hiện. Các bước riêng lẻ sẽ tự động kết thúc sau 1 giờ.

### Cách thức hoạt động của các phiên

Mỗi phiên khởi tạo một bản sao mới hoàn toàn của ảnh chụp nhanh. Khi phiên kết thúc, tất cả các thay đổi sẽ bị loại bỏ. Khi bắt đầu phiên:

1. Mã nguồn mới nhất được tải về từ các kho lưu trữ có liên quan.
2. Các lệnh `bảo trì` (của doanh nghiệp, tổ chức và kho lưu trữ) được hiển thị cho tác nhân dưới dạng ngữ cảnh — **không tự động thực thi**. Tác nhân có thể chạy lại chúng nếu phát hiện các phụ thuộc đã thay đổi kể từ lần xây dựng cuối cùng.
3. Các mục `kiến thức` của kho lưu trữ đó được tải vào ngữ cảnh của Devin.

<Thông tin>
  **Kiến thức được lưu trữ riêng cho từng kho lưu trữ.** Nếu bạn đã cấu hình 5 kho lưu trữ, Devin chỉ thấy các mục kiến thức của kho lưu trữ mà nó đang xử lý.
</Thông tin>

### Điều gì kích hoạt quá trình xây dựng

| Kích hoạt | Mô tả |
| ------------------------------- | -------------------------------------------------- |
| Lưu bản thiết kế | Tạo, cập nhật hoặc xóa bản thiết kế |
| Thêm hoặc xóa kho lưu trữ | Bất kỳ thay đổi nào đối với danh sách kho lưu trữ |
| Thêm bí mật kho lưu trữ | Các bí mật mới yêu cầu xây dựng lại để có thể sử dụng được |
| Kích hoạt thủ công | Nhấp vào **Build snapshot** trong giao diện người dùng |
| Làm mới định kỳ | Tự động, khoảng 24 giờ một lần |
| Đề xuất của Devin | Devin đề xuất thay đổi bản thiết kế trong một buổi họp |

Chỉ có một bản dựng được chạy tại một thời điểm. Các tác nhân kích hoạt mới sẽ hủy bỏ bất kỳ bản dựng nào đang chờ xử lý và bắt đầu lại từ đầu.

### Trạng thái bản dựng

| Trạng thái | Ý nghĩa |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Đang chờ** | Quá trình biên dịch đã được chấp nhận và đang chờ máy. |
| **Đang xây dựng** | Các bước thiết lập đang được chạy trên máy chủ xây dựng. |
| **Thành công** | Tất cả các bước đã hoàn tất. Ảnh chụp màn hình đã sẵn sàng. |
| **Một phần** | Một số bước ở cấp độ kho lưu trữ đã thất bại, nhưng bản sao lưu vẫn có thể sử dụng được. Các kho lưu trữ thành công hoạt động bình thường; các kho lưu trữ thất bại cần sửa chữa bản thiết kế của chúng. |
| **Thất bại** | Ảnh chụp nhanh không thể sử dụng được. Điều này xảy ra khi bản thiết kế của tổ chức hoặc doanh nghiệp bị lỗi (bao gồm cả các bước sau khi xây dựng), kho lưu trữ không thể sao chép hoặc máy không vượt qua các bước kiểm tra sức khỏe cuối cùng. |
| **Đã bị hủy** | Đã được thay thế bằng bản dựng mới hơn hoặc bị hủy thủ công. |

Bản dựng **một phần** vẫn tạo ra một bản sao hoạt động. Mọi kho lưu trữ đều đã được sao chép, vì vậy tất cả mã nguồn của bạn đều có sẵn trong phiên làm việc — chỉ có các bước thiết lập của các bản thiết kế bị lỗi là không được thực thi. Nếu một trong năm kho lưu trữ có bản thiết kế bị lỗi, bốn kho còn lại vẫn được thiết lập đầy đủ và Devin vẫn có thể đọc và làm việc trên kho thứ năm.

<Mẹo>
  **Quá trình biên dịch thất bại?** Xem [Khắc phục sự cố biên dịch](#troubleshooting-builds) để được hướng dẫn gỡ lỗi từng bước.
</Mẹo>

## Quản lý môi trường của bạn

### Trạng thái kho lưu trữ

Kho lưu trữ xuất hiện ở ba trạng thái trong phần cài đặt Môi trường:

| Trạng thái | Ý nghĩa |
| -------------- | ------------------------------------------------------------------------------------ |
| **Đã cấu hình** | Có bản thiết kế với các bước khởi tạo/bảo trì/kiến thức. Đã được thiết lập đầy đủ trong ảnh chụp nhanh. |
| **Đã bao gồm** | Được sao chép vào bản chụp nhanh nhưng không có bản thiết kế tùy chỉnh. Devin có thể truy cập mã. |
| **Có sẵn** | Đã kết nối với tổ chức nhưng chưa được thêm vào môi trường. Chưa được sao chép. |

**Bao gồm so với cấu hình:** Một kho lưu trữ "bao gồm" được sao chép để Devin có thể truy cập mã nguồn, nhưng không có các lệnh thiết lập tùy chỉnh. Một kho lưu trữ "cấu hình" có các hướng dẫn khởi tạo/bảo trì/kiến thức rõ ràng.

### Bí mật

Tham chiếu các thông tin bí mật bằng cú pháp `$VARIABLE_NAME`. Thêm chúng vào tab **Secrets** trong trình chỉnh sửa blueprint.

```yaml theme={null}
BẢO TRÌ:
  - tên: Cấu hình registry riêng tư
    Chạy lệnh: `npm config set //registry.npmjs.org/:_authToken $NPM_TOKEN`
```

Các thông tin bí mật được lưu trữ dưới dạng biến môi trường trong quá trình xây dựng và phiên làm việc. Chúng sẽ bị xóa trước khi ảnh chụp nhanh được lưu, nhưng nếu một lệnh ghi giá trị bí mật vào tệp cấu hình trong quá trình `initialize`, giá trị đó sẽ được lưu giữ trong ảnh chụp nhanh. Hãy đặt các bước ghi thông tin xác thực vào `maintenance` để chúng được làm mới trong các lần xây dựng định kỳ.

Để biết chi tiết về phạm vi và hành vi của các biến bí mật, hãy xem [Tham chiếu Blueprint](/onboard-devin/environment/blueprint-reference#environment-variables-and-secrets).

### Nhiều kho lưu trữ

Mỗi kho lưu trữ có một bản thiết kế riêng. Trong quá trình xây dựng, tất cả các kho lưu trữ được thiết lập trong cùng một ảnh chụp nhanh, được sao chép vào các thư mục riêng biệt với các phụ thuộc được cài đặt độc lập.

Nếu hai kho lưu trữ cài đặt các phiên bản khác nhau của một công cụ toàn cục hoặc sửa đổi các tệp dùng chung (như `~/.bashrc`), thì kho lưu trữ nào chạy sau sẽ được ưu tiên. Hãy đưa việc cài đặt các công cụ dùng chung vào bản thiết kế toàn tổ chức để tránh xung đột.

### GitHub Actions

Thay vì viết các tập lệnh shell để cài đặt công cụ và môi trường chạy, bạn có thể tham chiếu trực tiếp GitHub Actions trong bản thiết kế của mình. Devin sẽ tải xuống và chạy hành động trong quá trình xây dựng, tương tự như cách các trình chạy CI của GitHub thực hiện các bước hành động.

```yaml theme={null}
Khởi tạo:
  - Tên: Cài đặt Python 3.12
    Cách sử dụng: github.com/actions/setup-python@v5
    với:
      phiên bản python: "3.12"
```

Điều này đặc biệt hữu ích cho các thao tác thiết lập ngôn ngữ như `setup-python`, `setup-node` và `setup-go`, vốn tự động xử lý việc quản lý phiên bản và cấu hình PATH.

Để biết chi tiết về cú pháp, ví dụ và các hạn chế, hãy xem [GitHub Actions in blueprints](/onboard-devin/environment/github-actions).

### Monorepos

Bạn có thể chạy các lệnh trong thư mục con bằng cách sử dụng subshell, hoặc tạo các blueprint chuyên dụng cho từng gói riêng lẻ. Devin cũng hỗ trợ các mục kiến thức riêng cho mỗi gói, vì vậy mỗi workspace sẽ có cá
#!/usr/bin/env bash
# setup-cursor-auth.sh
# Script hỗ trợ thiết lập xác thực Cursor CLI / Agent cho Velclaw
# An toàn: không hardcode key, không commit secret, chỉ hướng dẫn + verify

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Velclaw Cursor Auth Setup ===${NC}"

# 1. Kiểm tra CLI đã cài chưa
if ! command -v agent &> /dev/null && ! command -v cursor-agent &> /dev/null; then
  echo -e "${YELLOW}Cursor Agent CLI chưa được cài.${NC}"
  echo "Cài đặt bằng lệnh:"
  echo "  curl https://cursor.com/install -fsS | bash"
  echo "Sau đó mở terminal mới hoặc source lại shell."
  exit 1
fi

AGENT_CMD="agent"
if ! command -v agent &> /dev/null; then
  AGENT_CMD="cursor-agent"
fi

echo "Đang dùng CLI: $AGENT_CMD"

# 2. Kiểm tra trạng thái hiện tại
echo -e "\n${GREEN}Trạng thái xác thực hiện tại:${NC}"
$AGENT_CMD status || true

# 3. Hướng dẫn chọn phương thức
echo -e "\n${YELLOW}Chọn phương thức xác thực:${NC}"
echo "1) Browser login (khuyến nghị cho máy cá nhân)"
echo "2) API Key (khuyến nghị cho automation / CI / agent)"
echo "3) Thoát"

read -r -p "Lựa chọn (1/2/3): " choice

case "$choice" in
  1)
    echo -e "\n${GREEN}Khởi động browser login...${NC}"
    if [[ "${NO_OPEN_BROWSER:-}" == "1" ]]; then
      echo "NO_OPEN_BROWSER=1 đã set, sẽ in URL đăng nhập."
    fi
    $AGENT_CMD login
    ;;
  2)
    echo -e "\n${YELLOW}Tạo API Key tại: https://cursor.com/dashboard/api${NC}"
    echo "Sau đó dán key vào đây (input sẽ bị ẩn):"
    read -r -s -p "CURSOR_API_KEY: " api_key
    echo

    if [[ -z "$api_key" ]]; then
      echo -e "${RED}Không nhập key. Hủy.${NC}"
      exit 1
    fi

    # Export tạm thời cho session hiện tại
    export CURSOR_API_KEY="$api_key"
    echo -e "${GREEN}Đã set CURSOR_API_KEY cho session hiện tại.${NC}"

    # Hỏi có muốn ghi vào shell profile không
    read -r -p "Ghi vào ~/.bashrc hoặc ~/.zshrc để dùng lâu dài? (y/N): " persist
    if [[ "$persist" =~ ^[Yy]$ ]]; then
      SHELL_RC="$HOME/.bashrc"
      if [[ "$SHELL" == *"zsh"* ]]; then
        SHELL_RC="$HOME/.zshrc"
      fi
      echo "" >> "$SHELL_RC"
      echo "# Cursor API Key (Velclaw setup)" >> "$SHELL_RC"
      echo "export CURSOR_API_KEY='$api_key'" >> "$SHELL_RC"
      echo -e "${GREEN}Đã thêm vào $SHELL_RC${NC}"
      echo "Chạy: source $SHELL_RC"
    else
      echo "Chỉ áp dụng cho session hiện tại. Để dùng lâu dài hãy export thủ công."
    fi
    ;;
  3)
    echo "Thoát."
    exit 0
    ;;
  *)
    echo -e "${RED}Lựa chọn không hợp lệ.${NC}"
    exit 1
    ;;
esac

# 4. Verify
echo -e "\n${GREEN}Kiểm tra lại trạng thái:${NC}"
$AGENT_CMD status || true

echo -e "\n${GREEN}Hoàn tất.${NC}"
echo "Test nhanh: $AGENT_CMD -p 'Hello from Velclaw Cursor auth setup'"
echo "Nhớ: Không commit API key vào git. Dùng env var hoặc secret store."

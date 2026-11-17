export const nav = [
  {
    section: 'Bắt đầu',
    items: [
      { label: 'Giới thiệu', path: '/' },
      { label: 'Bắt đầu sử dụng', path: '/bat-dau' },
      { label: 'Cài đặt', path: '/cai-dat' },
    ],
  },
  {
    section: 'Xây dựng',
    items: [
      { label: 'Cấu hình dự án', path: '/cau-hinh' },
      { label: 'Triển khai', path: '/trien-khai' },
    ],
  },
]

export const flatNav = nav.flatMap((group) => group.items)

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome",
      "view_menu": "View Menu",
      "add_to_cart": "Add to Cart",
      "place_order": "Place Order",
      "table": "Table",
      "active_session": "Active Session",
      "interactive_table_ordering": "Interactive Table Ordering",
      "browse_menu_desc": "Browse menu items, add your favorite selections, and order instantly. Simply scan the table QR code to browse or manually select a simulated table below to see routing details.",
      "simulate_scanning": "Simulate Scanning:",
      "table_qr_links": "Table QR Links",
      "generate_qr_desc": "Generate active URL path QR codes",
      "open_qr_hub": "Open QR Code Hub",
      "order_basket": "Order Basket",
      "clear": "Clear",
      "basket_empty": "Your basket is empty",
      "select_items": "Select appetizing foods and drinks from our menu above!",
      "special_notes": "Special Notes / Requests:",
      "notes_placeholder": "e.g., No onions, extra spicy, ice on side...",
      "subtotal": "Subtotal",
      "vat": "VAT / Service Charge",
      "included": "Included",
      "total_due": "Total Due",
      "submitting_order": "Submitting Order...",
      "confirm_send_order": "Confirm & Send Order",
      "sent_to_kitchen": "Sent to Kitchen!",
      "preparing_text": "Your order is being prepared. View status below in the Live Order Tracker.",
      "live_order_tracker": "Live Order Tracker",
      "live_order_tracker_desc": "Track and monitor your table's direct order status history saved in the backend",
      "no_orders_recorded": "No active orders recorded for {{table}} yet. Place your first order above!",
      "ticket": "Ticket",
      "placed": "Placed",
      "options": "options",
      "switched_session": "Switched terminal active session to {{table}}",
      "added_to_menu": "Added {{name}} to menu!",
      "add_new_product": "Add Product",
      "kitchen_deck": "Kitchen Deck",
      "customer_menu": "Customer Menu",
      "qr_hub": "QR Hub",
      "each": "each",
      "grand_total": "Grand Total",
      "view_active_order": "View Active Order",
      "items_ready": "{{count}} items ready",
      "ordering": "ordering",
      "no_items_found": "No culinary items found in this section.",
      "delicious_choice": "Delicious choice",
      "pending": "Pending",
      "preparing": "Preparing",
      "served": "Served",
      "completed": "Completed"
    }
  },
  km: {
    translation: {
      "welcome": "សូមស្វាគមន៍",
      "view_menu": "មើលមុខម្ហូប",
      "add_to_cart": "ថែមចូលកន្ត្រក",
      "place_order": "ផ្ញើការកុម្ម៉ង់",
      "table": "តុ",
      "active_session": "តុសកម្ម",
      "interactive_table_ordering": "ការកុម្ម៉ង់តាមតុអន្តរកម្ម",
      "browse_menu_desc": "រកមើលមុខម្ហូប បន្ថែមជម្រើសដែលអ្នកចូលចិត្ត និងកុម្ម៉ង់ភ្លាមៗ។ គ្រាន់តែស្កេនកូដ QR តុ ដើម្បីរកមើល ឬជ្រើសរើសតុសាកល្បងដោយដៃខាងក្រោមដើម្បីមើលព័ត៌មានលម្អិត។",
      "simulate_scanning": "សាកល្បងស្កេន៖",
      "table_qr_links": "តំណភ្ជាប់ QR តុ",
      "generate_qr_desc": "បង្កើតកូដ QR នៃតំណភ្ជាប់សកម្ម",
      "open_qr_hub": "បើកមជ្ឈមណ្ឌលកូដ QR",
      "order_basket": "កន្ត្រកកុម្ម៉ង់",
      "clear": "សម្អាត",
      "basket_empty": "កន្ត្រករបស់អ្នកទទេ",
      "select_items": "សូមជ្រើសរើសម្ហូប និងភេសជ្ជៈដែលគួរឱ្យចង់ញ៉ាំពីខាងលើ!",
      "special_notes": "កំណត់ចំណាំពិសេស / ការស្នើសុំ៖",
      "notes_placeholder": "ឧទាហរណ៍៖ កុំដាក់ខ្ទឹមបារាំង, ហឹរខ្លាំង, ទឹកកកក្រៅ...",
      "subtotal": "សរុបរង",
      "vat": "អាករលើតម្លៃបន្ថែម / ថ្លៃសេវាកម្ម",
      "included": "រួមបញ្ចូលហើយ",
      "total_due": "ទឹកប្រាក់សរុប",
      "submitting_order": "កំពុងផ្ញើការកុម្ម៉ង់...",
      "confirm_send_order": "បញ្ជាក់ & ផ្ញើការកុម្ម៉ង់",
      "sent_to_kitchen": "បានផ្ញើទៅផ្ទះបាយ!",
      "preparing_text": "ការកុម្ម៉ង់របស់អ្នកកំពុងត្រូវបានរៀបចំ។ មើលស្ថានភាពនៅខាងក្រោមក្នុងម៉ាស៊ីនតាមដានការកុម្ម៉ង់ផ្ទាល់។",
      "live_order_tracker": "ការតាមដានការកុម្ម៉ង់ផ្ទាល់",
      "live_order_tracker_desc": "តាមដាន និងត្រួតពិនិត្យប្រវត្តិកុម្ម៉ង់ផ្ទាល់របស់តុអ្នកដែលបានរក្សាទុកក្នុងប្រព័ន្ធ",
      "no_orders_recorded": "មិនទាន់មានការកុម្ម៉ង់សម្រាប់ {{table}} នៅឡើយទេ។ សូមផ្ញើការកុម្ម៉ង់ដំបូងរបស់អ្នកខាងលើ!",
      "ticket": "សំបុត្រកុម្ម៉ង់",
      "placed": "បានកុម្ម៉ង់នៅម៉ោង",
      "options": "មុខម្ហូប",
      "switched_session": "បានប្តូរតុទៅកាន់ {{table}}",
      "added_to_menu": "បានបន្ថែម {{name}} ទៅក្នុងបញ្ជីមុខម្ហូប!",
      "add_new_product": "បន្ថែមមុខម្ហូប",
      "kitchen_deck": "ផ្ទាំងគ្រប់គ្រងផ្ទះបាយ",
      "customer_menu": "បញ្ជីមុខម្ហូបភ្ញៀវ",
      "qr_hub": "មជ្ឈមណ្ឌល QR",
      "each": "ក្នុងមួយមុខ",
      "grand_total": "សរុបទាំងអស់",
      "view_active_order": "មើលការកុម្ម៉ង់សកម្ម",
      "items_ready": "មាន {{count}} មុខ",
      "ordering": "កំពុងកុម្ម៉ង់",
      "no_items_found": "គ្មានមុខម្ហូបនៅក្នុងផ្នែកនេះទេ",
      "delicious_choice": "ជម្រើសដ៏ឆ្ងាញ់",
      "pending": "កំពុងរង់ចាំ",
      "preparing": "កំពុងរៀបចំ",
      "served": "បានជូនភ្ញៀវ",
      "completed": "បានរួចរាល់"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;

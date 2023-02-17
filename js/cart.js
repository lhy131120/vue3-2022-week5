// import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.45/vue.esm-browser.min.js'

const domain = 'https://vue3-course-api.hexschool.io/v2'
const api_path = 'sakimotorin-vue2022'

const { Form, Field, ErrorMessage, defineRule, configure } = VeeValidate
const { loadLocaleFromURL, localize } = VeeValidateI18n

// 全部加入(CDN 版本)
Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== 'default') {
    defineRule(rule, VeeValidateRules[rule])
  }
})

// 讀取外部的資源,加入多國語系
loadLocaleFromURL(
  'https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json',
)

// // Activate the locale
configure({
  generateMessage: localize('zh_TW'),
})

// 元件
const productModal = {
  props: ['id', 'addToCart', 'openModal'],
  data() {
    return {
      tempProduct: {},
      modal: {},
      qty: 1,
    }
  },
  template: '#userProductModal',
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal)
    this.$refs.modal.addEventListener('hidden.bs.modal', (event) => {
      this.openModal('')
    })
  },
  watch: {
    // 監聽prop的資料
    id() {
      // console.log(`watch回來的 Id: ${this.id}`)
      if (this.id) {
        axios
          .get(`${domain}/api/${api_path}/product/${this.id}`)
          .then((res) => {
            // console.log('單一產品', res.data.product)
            this.tempProduct = res.data.product
            this.showModal()
          })
      }
    },
  },
  methods: {
    showModal() {
      this.modal.show()
    },
    hideModal() {
      this.modal.hide()
    },
  },
}

// 根元件
const vm = Vue.createApp({
  data() {
    return {
      products: [],
      productId: '',
      cart: {},
      loadingItem: '',
      clearAll: false,
      user: {
        name: '',
        email: '',
        tel: '',
        address: '',
        message: '',
      },
    }
  },
  components: {
    productModal,
    VForm: Form,
    VField: Field,
    ErrorMessage: ErrorMessage,
  },
  methods: {
    onSubmit() {
      console.log('onSubmit')
    },
    getProducts() {
      axios.get(`${domain}/api/${api_path}/products/all`).then((res) => {
        // console.log('產品列表', res.data.products)
        this.products = res.data.products
      })
    },
    openModal(id) {
      this.productId = id
      // console.log(`外層帶入 productId: ${id}`)
    },
    addToCart(product_id, qty = 1) {
      this.loadingItem = product_id
      const data = { product_id, qty }
      axios.post(`${domain}/api/${api_path}/cart`, { data }).then((res) => {
        this.loadingItem = ''
        alert(res.data.message)
        this.$refs.productModal.hideModal()
        this.getCarts()
      })
    },
    getCarts() {
      axios.get(`${domain}/api/${api_path}/cart`).then((res) => {
        // console.log('購物車:', res.data.data)
        this.cart = res.data.data
      })
    },
    modifyItemQty(item) {
      this.loadingItem = item.id
      const data = {
        product_id: item.product.id,
        qty: item.qty,
      }
      axios
        .put(`${domain}/api/${api_path}/cart/${item.id}`, { data })
        .then((res) => {
          alert(res.data.message)
          this.loadingItem = ''
          this.getCarts()
        })
    },
    deleteItem(item) {
      this.loadingItem = item.id
      axios
        .delete(`${domain}/api/${api_path}/cart/${item.id}`)
        .then((res) => {
          this.loadingItem = ''
          alert(res.data.message)
          this.getCarts()
        })
        .catch((err) => {
          alert(err.response.data.message)
        })
    },
    deleteAllItem() {
      this.clearAll = true
      axios.delete(`${domain}/api/${api_path}/carts`).then((res) => {
        alert(res.data.message)
        this.clearAll = false
        this.getCarts()
      })
    },
  },
  mounted() {
    this.getProducts()
    this.getCarts()
  },
})

vm.mount('#app')

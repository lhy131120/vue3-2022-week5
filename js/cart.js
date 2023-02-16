import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.45/vue.esm-browser.min.js'

const domain = 'https://vue3-course-api.hexschool.io/v2'
const api_path = 'sakimotorin-vue2022'

const productModal = {
  props: ['id', 'addToCart'],
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
  },
  watch: {
    // 監聽prop的資料
    id() {
      console.log(`watch回來的 Id: ${this.id}`)
      axios.get(`${domain}/api/${api_path}/product/${this.id}`).then((res) => {
        console.log('單一產品', res.data.product)
        this.tempProduct = res.data.product
        this.showModal()
      })
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

const vm = createApp({
  data() {
    return {
      products: [],
      productId: '',
      cart: {},
    }
  },
  components: {
    productModal,
  },
  methods: {
    getProducts() {
      axios.get(`${domain}/api/${api_path}/products/all`).then((res) => {
        console.log('產品列表', res.data.products)
        this.products = res.data.products
      })
    },
    openModal(id) {
      this.productId = id
      console.log(`外層帶入 productId: ${id}`)
    },
    addToCart(product_id, qty = 1) {
      const data = { product_id, qty }
      axios.post(`${domain}/api/${api_path}/cart`, { data }).then((res) => {
        console.log(res.data)
        setTimeout(() => {
          this.$refs.productModal.hideModal()
        }, 300)
        this.getCarts()
      })
    },
    getCarts() {
      axios.get(`${domain}/api/${api_path}/cart`).then((res) => {
        console.log('購物車:', res.data.data)
        this.cart = res.data.data
      })
    },
    modifyItemQty(item) {
      const data = {
        product_id: item.product.id,
        qty: item.qty,
      }
      // console.log(data, item.id);
      axios
        .put(`${domain}/api/${api_path}/cart/${item.id}`, { data })
        .then((res) => {
          console.log('更新後的產品', res.data)
          this.getCarts()
        })
    },
    deleteItem(item) {
      axios.delete(`${domain}/api/${api_path}/cart/${item.id}`).then((res) => {
        console.log(res.data)
        this.getCarts()
      })
    },
    deleteAllItem() {
      axios.delete(`${domain}/api/${api_path}/carts`).then((res) => {
        console.log(res.data)
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

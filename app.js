const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "570icinkuy0c",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "fG4I8aPX6sLcZhsrEomwPgr93X6afq-Ays-D14v0lTg"
});

// variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const checkoutItem = document.querySelector(".checkout-items");
const checkoutPrice = document.querySelector(".price");
const modalContent = document.querySelector(".modal-content");
const modal = document.getElementById("myModal");
const checkoutDOM = document.querySelector(".modal");
const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];

// checkout items

let checkoutItems = [];

// buttons
let buttonDOM = [];

// Get the button that opens the modal
let btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// getting the products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: "onlineShopProducts"
      });

      // let result = await fetch("products.json");
      // let data = await result.json();

      let products = contentful.items;
      products = products.map(item => {
        const { id } = item.sys;
        const { title, price } = item.fields;
        const image = item.fields.image.fields.file.url;
        return { id, title, price, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducrs(products) {
    let result = "";
    products.forEach(product => {
      result += `
        <!-- single product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
         <!-- end of single product -->
      `;
    });
    productsDOM.innerHTML = result;
  }

  getCartButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", event => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        checkoutItems = cart;
        Storage.saveCheckoutItems(checkoutItems);
        this.setCartValues(cart);
        this.setCheckoutValues(checkoutItems);
        this.addCartItem(cartItem);
        this.addCheckoutItem(checkoutItem);

        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  setCheckoutValues(checkoutItems) {
    let tempTotal = 0;
    let itemsTotal = 0;
    checkoutItems.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    checkoutPrice.innerText = parseFloat(tempTotal.toFixed(2));
    checkoutItem.innerText = itemsTotal;
    // this.addCheckoutItem(checkoutItems);
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>`;
    cartContent.appendChild(div);
  }

  addCheckoutItem(item) {
    const div = document.createElement("div");
    div.classList.add("checkout-item");
    div.innerHTML = `
      <p>${item.title}<span>${item.amount}</span><span class="price">$ ${item.price}</span></p>
      <hr>
      <p>Total <span class="price" style="color:black"><b>$ ${item.tempTotal}</b></span></p>
    `;
    checkoutItem.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    cart = Storage.getCart();
    checkoutItems = Storage.getCheckoutItems();
    this.setCartValues(cart);
    this.setCheckoutValues(checkoutItems);
    this.populateCart(cart);
    this.populateCheckout(checkoutItems);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  populateCheckout(checkoutItems) {
    checkoutItems.forEach(item => this.addCheckoutItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });

    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });

    Storage.getCheckoutItems(checkoutItems);
    this.setCheckoutValues(checkoutItems);
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    let checkoutItem = checkoutItems.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    checkoutItem.forEach(id => this.removeItem(id));
    console.log(checkoutItem.children);
    while (checkoutItem.children.length > 0) {
      checkoutItem.removeChild(checkoutItem.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    checkoutItems = checkoutItems.filter(item => item.id !== id);
    this.setCartValues(cart);
    this.setCheckoutValues(checkoutItems);
    Storage.saveCart(cart);
    Storage.saveCheckoutItems(checkoutItems);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleButton(id) {
    return buttonDOM.find(button => button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }

  static saveCheckoutItems(checkoutItems) {
    localStorage.setItem("checkoutItems", JSON.stringify(checkoutItems));
  }

  static getCheckoutItems() {
    return localStorage.getItem("checkoutItems")
      ? JSON.parse(localStorage.getItem("checkoutItems"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupAPP();
  // get all products
  products
    .getProducts()
    .then(products => {
      ui.displayProducrs(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getCartButtons();
      ui.cartLogic();
    });
});

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

const checkoutDOM = document.querySelector(".modal");
const modal = document.getElementById("myModal");
const checkoutItems = document.querySelector(".checkout-items");
const checkoutTotal = document.querySelector(".checkout-total");
const modalContent = document.querySelector(".modal-content");

const form = document.querySelector(".form");

const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];

// checkout items

let checkout = [];

// buttons
let buttonDOM = [];

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

        // let checkoutItem = { ...Storage.getCart(id), amount: 1 };
        // checkout = [...checkout, checkoutItem];

        Storage.saveCart(cart);
        // Storage.saveCheckoutItems(checkout);
        this.setCartValues(cart);
        // this.setCheckoutValues(checkout);

        this.addCartItem(cartItem);
        // this.addCheckoutItem(cart);

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

  // setCheckoutValues(checkout) {
  //   let tempTotal = 0;
  //   let itemsTotal = 0;
  //   checkout.map(item => {
  //     tempTotal += item.price * item.amount;
  //     itemsTotal += item.amount;
  //   });
  //   checkoutTotal.innerText = parseFloat(tempTotal.toFixed(2));
  //   checkoutItems.innerText = itemsTotal;
  //   // this.addCheckoutItem(checkoutItems);
  // }

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

    const checkout = document.createElement("div");
    checkout.classList.add("cart-item");
    checkout.innerHTML = ` <img src=${item.image} alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        
                    </div>
                    <div>
                        
                        <p data-id=${item.id} class="item-amount">${item.amount}</p>
                    </div>
                   `;
    checkoutItems.appendChild(checkout);
  }

  // addCheckoutItem(item) {
  //   const div = document.createElement("div");
  //   div.classList.add("cart-item");
  //   div.innerHTML = `
  //                   <div>
  //                       <h4>${item.title}</h4>
  //                       <h5>$${item.price}</h5>
  //                       <span class="remove-item" data-id=${item.id}>remove</span>
  //                   </div>
  //                   <div>
  //                       <i class="fas fa-chevron-up" data-id=${item.id}></i>
  //                       <p class="item-amount">${item.amount}</p>
  //                       <i class="fas fa-chevron-down" data-id=${item.id}></i>
  //                   </div>`;
  //   checkoutItems.appendChild(div);
  // }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    cart = Storage.getCart();
    // checkout = Storage.getCheckoutItems();
    this.setCartValues(cart);
    // this.setCheckoutValues(checkout);
    this.populateCart(cart);
    // this.populateCheckout(checkout);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    // Get the button that opens the modal
    let btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = () => {
      modal.style.display = "block";
    };

    // When the user clicks on <span> (x), close the modal
    span.onclick = () => {
      modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = event => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  // populateCheckout(checkout) {
  //   checkout.forEach(item => this.addCheckoutItem(item));
  // }

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

    // checkoutItems.addEventListener("click", event => {
    //   if (event.target.classList.contains("remove-item")) {
    //     let removeItem = event.target;
    //     let id = removeItem.dataset.id;
    //     checkoutItems.removeChild(removeItem.parentElement.parentElement);
    //     this.removeItem(id);
    //   } else if (event.target.classList.contains("fa-chevron-up")) {
    //     let addAmount = event.target;
    //     let id = addAmount.dataset.id;
    //     let tempItem = cart.find(item => item.id === id);
    //     tempItem.amount = tempItem.amount + 1;
    //     Storage.saveCart(cart);
    //     this.setCartValues(cart);
    //     addAmount.nextElementSibling.innerText = tempItem.amount;
    //   } else if (event.target.classList.contains("fa-chevron-down")) {
    //     let lowerAmount = event.target;
    //     let id = lowerAmount.dataset.id;
    //     let tempItem = cart.find(item => item.id === id);
    //     tempItem.amount = tempItem.amount - 1;
    //     if (tempItem.amount > 0) {
    //       Storage.saveCart(cart);
    //       this.setCartValues(cart);
    //       lowerAmount.previousElementSibling.innerText = tempItem.amount;
    //     } else {
    //       checkoutItems.removeChild(lowerAmount.parentElement.parentElement);
    //       this.removeItem(id);
    //     }
    //   }
    // });
    // Storage.getCheckoutItems(checkout);
    // this.setCheckoutValues(checkout);
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    // let checkoutItems = checkout.map(item => item.id);

    cartItems.forEach(id => this.removeItem(id));
    console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }

    // checkoutItems.forEach(id => this.removeItem(id));
    // console.log(checkoutItems.children);
    // while (checkoutItems.children.length > 0) {
    //   checkoutItems.removeChild(checkoutItems.children[0]);
    // }

    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    // checkout = checkout.filter(item => item.id !== id);
    this.setCartValues(cart);
    // this.setCheckoutValues(checkout);
    Storage.saveCart(cart);
    // Storage.saveCheckoutItems(checkout);
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

  // static saveCheckoutItems(checkout) {
  //   localStorage.setItem("checkout", JSON.stringify(checkout));
  // }

  // static getCheckoutItems() {
  //   return localStorage.getItem("checkout")
  //     ? JSON.parse(localStorage.getItem("checkout"))
  //     : [];
  // }
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

//variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const closeContent = document.querySelector('.close-content');
const productDOM = document.querySelector('.products-center');
const cartContent = document.querySelector('.cart-content');

//cart

let cart = [];
//buttons
let buttonsDom = [];

//getting the products

class Products {
   async getProducts(){
       try {
        let result = await fetch('products.json');
        let data = await result.json();
        let products = data.items;
        //destructure the items
        products = products.map((item) =>{
            const {title,price} = item.fields;
            const {id} = item.sys;
            const image = item.fields.image.fields.file.url;
            return {title,price,id,image}

        })
        return products;

       } catch(error){
           console.log(error);
       }
    
    }

}

//display products
class UI {
    displayProduct(products){
        let result = '';
        products.forEach(product => {
            result += `<article class="product">
            <div class="img-container">
                <img
                 src=${product.image}
                class="product-img"
                />
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i>
                    add to bag
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
        </article>
        <!--end of single product-->`
            
        });
        productDOM.innerHTML = result;
    
    }

    getBagButton(){
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDom = buttons;
        buttons.forEach(button =>{
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart){
                button.innerText = "In Cart";
                button.disabled = true;
            }

            
                button.addEventListener('click', (event) =>{
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;
                    //get product from products through the ID
                    let cartItem = {...Storage.getProduct(id), amount: 1};
                    
                    //add product to cart
                    cart = [...cart, cartItem];
                    
                    //save cart to local storage
                    Storage.saveCart(cart );
                    //set cart values
                    this.setCartValues(cart);
                    //display cart item
                    this.addCartItem(cartItem);

                    //show the cart
                    this.showCart();
                })
            
        });

    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;

        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image}>
        <div>
            <h4>${item.title}</h4>
            <h3>$${item.price}</h3>
            <span class="remove-item" data-id = ${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id = ${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id = ${item.id}></i>
        </div>`;
        cartContent.appendChild(div);    
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    populateCart(cart){
        cart.forEach(item =>this.addCartItem(item))

    }
    setupAPP(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart);

    }
    cartlogic(){
        //clear cart button
        clearCartBtn.addEventListener('click', () => {this.clearCart()
        });

        //cart fuctionality
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')){
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                this.remove(id);
                cartContent.removeChild(removeItem.parentElement.parentElement);
                
            }
            else if (event.target.classList.contains('fa-chevron-up')){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;

                
            }
            else if (event.target.classList.contains('fa-chevron-down')){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;

                }
                else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.remove(id);


                }


            }
        })
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.remove(id));
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
            this.hideCart();
        };
        
        
    }
    remove(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
        add to bag`;
    }
    getSingleButton(id){
        return buttonsDom.find(button => button.dataset.id===id)
    }

}

//local storage
class Storage {
    static saveProduct(products){
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart(){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }

}
// instantiate the Products class
var products = new Products();
// instantiate the Products class
const ui = new UI();

document.addEventListener("DOMContentLoaded", () => {
    //set up app
    ui.setupAPP();
    //get all products
products.getProducts().then(products => {
    ui.displayProduct(products);
     Storage.saveProduct(products);
     
}).then(()=>{
    ui.getBagButton();
    ui.cartlogic();
})

    
});



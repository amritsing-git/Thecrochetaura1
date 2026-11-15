const $=s=>document.querySelector(s);
const get=(k,d=[])=>JSON.parse(localStorage.getItem(k)||JSON.stringify(d));
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const money=n=>'₹'+Number(n).toLocaleString('en-IN');

function toast(msg){
 let t=$('#toast');
 if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.append(t)}
 t.textContent=msg;
 setTimeout(()=>t.remove(),2500);
}
function products(){return get('products')}
function cart(){return get('cart')}
function user(){return get('currentUser',null)}

function countCart(){
 document.querySelectorAll('.cart-count').forEach(e=>{
 e.textContent=cart().reduce((a,b)=>a+b.qty,0)
 });
}

function productCard(p){
 return `<div class="product-card">
 <a href="product.html?id=${p.id}">
 <div class="product-photo">${p.images?.[0]?`<img src="${p.images[0]}">`:'🧶'}</div></a>
 <div class="product-info">
 <span class="pill">${p.category}</span>
 <h3>${p.name}</h3>
 <div class="row"><b>${money(p.price)}</b>
 <button onclick="addCart('${p.id}')">Add +</button></div>
 </div></div>`;
}

function renderProducts(){
 let box=$('#productGrid');
 if(!box)return;
 let p=products();
 box.innerHTML=p.length?p.map(productCard).join():
 '<div class="empty">🧶<h3>Our handmade collection is coming soon!</h3></div>';
}

function addCart(id){
 let p=products().find(x=>x.id===id);
 if(!p)return;
 let c=cart(),item=c.find(x=>x.id===id);
 if(item)item.qty++;
 else c.push({id:p.id,name:p.name,price:p.price,qty:1});
 set('cart',c);countCart();toast('Added to cart ♡');
}

function renderProduct(){
 let box=$('#productView');
 if(!box)return;
 let id=new URLSearchParams(location.search).get('id');
 let p=products().find(x=>x.id===id);
 if(!p){box.innerHTML='<div class="empty">Product not found</div>';return}
 box.innerHTML=`<div class="two-col">
 <div><div class="product-photo" style="height:350px">${p.images?.[0]?`<img id="mainPhoto" src="${p.images[0]}">`:'🧶'}</div>
 <div class="upload-grid">${(p.images||[]).map(x=>`<img src="${x}" onclick="$('#mainPhoto').src=this.src" style="width:100%;border-radius:12px;margin-top:8px">`).join('')}</div></div>
 <div><span class="pill">${p.category}</span><h1>${p.name}</h1>
 <h2>${money(p.price)}</h2><p>${p.description||'Handmade with love.'}</p>
 <div class="field"><label>Quantity</label><input id="detailQty" type="number" min="1" value="1"></div>
 <button onclick="addCartQuantity('${p.id}')">Add to Cart</button></div></div>`;
}

function addCartQuantity(id){
 let p=products().find(x=>x.id===id);
 let c=cart(),n=Math.max(1,Number($('#detailQty').value));
 let x=c.find(x=>x.id===id);
 if(x)x.qty+=n;else c.push({id:p.id,name:p.name,price:p.price,qty:n});
 set('cart',c);countCart();toast('Added to cart ♡');
}

function renderCart(){
 let box=$('#cartItems');if(!box)return;
 let c=cart();
 box.innerHTML=c.length?c.map(x=>`
 <div class="cart-row"><div class="mini-photo">🧶</div>
 <div><b>${x.name}</b><p>${money(x.price)}</p>
 <div class="qty"><button onclick="changeQty('${x.id}',-1)">−</button>${x.qty}
 <button onclick="changeQty('${x.id}',1)">+</button></div></div>
 <div><b>${money(x.price*x.qty)}</b><br>
 <button class="outline" onclick="removeCart('${x.id}')">Remove</button></div></div>`).join(''):
 '<div class="empty">🧺<h2>Your cart is empty</h2><a class="btn" href="shop.html">Shop now</a></div>';
 if($('#cartTotal'))$('#cartTotal').textContent=money(c.reduce((a,x)=>a+x.price*x.qty,0));
}

function changeQty(id,n){
 let c=cart(),x=c.find(x=>x.id===id);
 if(x)x.qty=Math.max(1,x.qty+n);
 set('cart',c);renderCart();countCart();
}
function removeCart(id){
 set('cart',cart().filter(x=>x.id!==id));
 renderCart();countCart();
}

function requireLogin(){
 if(!user()){location.href='login.html';return false}
 return true;
}

function renderAccount(){
 let u=user();if(!u)return;
 if($('#profileName'))$('#profileName').textContent=u.name;
 if($('#profileEmail'))$('#profileEmail').textContent=u.email;
 if($('#profilePhone'))$('#profilePhone').textContent=u.phone||'';
 let orders=get('orders').filter(x=>x.email===u.email);
 let box=$('#accountOrders');
 if(box)box.innerHTML=orders.length?orders.map(orderCard).join():'No orders yet.';
 let all=$('#allOrders');
 if(all)all.innerHTML=orders.length?orders.map(orderCard).join():'No orders yet.';
}

function orderCard(o){
 return `<div class="order-card">
 <div class="row"><b>Order #${o.id}</b><span class="status">${o.status}</span></div>
 <p>${o.items.map(x=>x.name+' × '+x.qty).join(', ')}</p>
 <b>${money(o.total)}</b><p class="muted">${o.date}</p>
 </div>`;
}

function bindForms(){
 let f=$('#signupForm');
 if(f)f.onsubmit=e=>{
 e.preventDefault();
 let u={name:$('#name').value,email:$('#email').value.toLowerCase(),phone:$('#phone').value,password:$('#password').value};
 let users=get('users');
 if(users.some(x=>x.email===u.email)){toast('Email already registered');return}
 users.push(u);set('users',users);set('currentUser',u);
 location.href='account.html';
 };

 f=$('#loginForm');
 if(f)f.onsubmit=e=>{
 e.preventDefault();
 let u=get('users').find(x=>x.email===$('#email').value.toLowerCase()&&x.password===$('#password').value);
 if(!u){toast('Incorrect email or password');return}
 set('currentUser',u);location.href='account.html';
 };

 f=$('#profileForm');
 if(f)f.onsubmit=e=>{
 e.preventDefault();let u=user();
 u.name=$('#editName').value;u.phone=$('#editPhone').value;
 set('currentUser',u);
 set('users',get('users').map(x=>x.email===u.email?u:x));
 renderAccount();toast('Profile updated');
 };

 f=$('#customForm');
 if(f)f.onsubmit=e=>{
 e.preventDefault();
 let r=get('customRequests');
 r.unshift({id:Date.now(),name:$('#cname').value,email:$('#cemail').value,kind:$('#ckind').value,color:$('#ccolor').value,budget:$('#cbudget').value,details:$('#cdetails').value,status:'Pending'});
 set('customRequests',r);f.reset();toast('Request submitted ♡');
 };

 f=$('#checkoutForm');
 if(f)f.onsubmit=e=>{
 e.preventDefault();if(!requireLogin())return;
 let c=cart();if(!c.length){toast('Cart is empty');return}
 let u=user();
 let o={id:Date.now().toString().slice(-7),email:u.email,name:$('#shipName').value,phone:$('#shipPhone').value,address:$('#shipAddress').value,items:c,total:c.reduce((a,x)=>a+x.price*x.qty,0),status:'Order Successfully Placed',date:new Date().toLocaleString()};
 let orders=get('orders');orders.unshift(o);set('orders',orders);set('cart',[]);
 location.href='account.html?ordered=1';
 };
}

document.addEventListener('DOMContentLoaded',()=>{
 countCart();renderProducts();renderProduct();renderCart();renderAccount();bindForms();
 document.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>$('.navlinks').classList.toggle('open'));
 document.querySelectorAll('[data-logout]').forEach(b=>b.onclick=()=>{
 localStorage.removeItem('currentUser');location.href='index.html';
 });
 if(new URLSearchParams(location.search).has('ordered'))toast('Order successfully placed ♡');
});
/* CROCHET AURA MOBILE MENU */

document.addEventListener("DOMContentLoaded", function() {

  const menuButton = document.querySelector("[data-menu]");
  const navigation = document.querySelector(".navlinks");

  if (menuButton && navigation) {

    menuButton.addEventListener("click", function() {
      navigation.classList.toggle("menu-open");

      menuButton.textContent =
        navigation.classList.contains("menu-open") ? "✕" : "☰";
    });

    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", function() {
        navigation.classList.remove("menu-open");
        menuButton.textContent = "☰";
      });
    });
  }

});
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("[data-menu]");
  const nav = document.querySelector(".navlinks");

  if (!btn || !nav) return;

  btn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();

    nav.classList.toggle("menu-open");

    btn.innerHTML = nav.classList.contains("menu-open")
      ? "✕"
      : "☰";
  };
});
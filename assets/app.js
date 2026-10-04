const CONFIG=Object.assign({
shopName:"Sri Lakshmi Rice Wholesale",phone:"919999999999",address:"Main Market Road, Your City",
currency:"₹",Owner:"udayaanoopmayank@gmail.com",demoCustomer:"customer@demo.com",taxRate:0
},window.RICE_SHOP_CONFIG||{});
CONFIG.phone=CONFIG.whatsapp||CONFIG.phone;
const seedProducts=[
{id:1,name:"Sona Masuri Rice",pack:"25 kg",price:1450,stock:80},
{id:2,name:"Basmati Premium",pack:"25 kg",price:2200,stock:45},
{id:3,name:"Ponni Boiled Rice",pack:"26 kg",price:1580,stock:60},
{id:4,name:"Idli Rice",pack:"25 kg",price:1320,stock:90},
{id:5,name:"Broken Rice",pack:"25 kg",price:1050,stock:120}
];
const state={user:null,role:"customer",page:"dashboard",products:load("products",seedProducts),orders:load("orders",[]),cart:load("cart",[]),customers:load("customers",[]),invoices:load("invoices",[]),accounts:load("accounts",[]),pendingAccounts:load("pendingAccounts",[])};
function load(k,d){try{return JSON.parse(localStorage.getItem("rice_"+k))??d}catch{return d}}
function save(k,v){localStorage.setItem("rice_"+k,JSON.stringify(v))}
function money(n){return CONFIG.currency+Number(n||0).toLocaleString("en-IN",{maximumFractionDigits:2})}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function go(p){state.page=p;render()}
function logout(){state.user=null;render()}
function login(role,email){state.user={email,name:role==="owner"?"Shop Owner":"Customer"};state.role=role;state.page="dashboard";render()}
function render(){document.getElementById("app").innerHTML=state.user?appShell():loginPage()}
function loginPage(){
let isOwner=state.role==="owner";
return `<div class="login"><div class="loginbox"><div class="brand"><div class="logo">🌾</div><div>${CONFIG.shopName}</div></div>
<h1>${isOwner?"Owner Login":"Customer Login"}</h1><p class="muted">${isOwner?"Manage your wholesale business":"Login or create a customer account"}</p>
<div class="role-tabs"><button class="${isOwner?"active":""}" onclick="state.role='owner';render()">Owner Login</button><button class="${!isOwner?"active":""}" onclick="state.role='customer';render()">Customer</button></div>
${isOwner?`<form class="form" onsubmit="event.preventDefault();login('owner',this.email.value)"><div class="field"><label>Email / Mobile</label><input name="email" value="${CONFIG.demoOwner}" required></div><div class="field"><label>Password</label><input name="password" type="password" value="demo123" required></div><button class="btn primary">Sign in</button></form>`:
`<div class="role-tabs"><button id="loginTab" class="active" onclick="customerAuthMode='login';render()">Login</button><button id="registerTab" onclick="customerAuthMode='register';render()">Register</button></div>${customerAuthMode==="login"?customerLoginForm():customerRegisterForm()}`}
${isOwner?`<p class="muted" style="font-size:12px;margin-top:15px">Demo owner password: <b>demo123</b></p>`:""}
</div></div>`
}
let customerAuthMode="login";
function customerLoginForm(){
return `<form class="form" onsubmit="event.preventDefault();customerLogin(this)"><div class="field"><label>Email or Mobile</label><input name="identity" required></div><div class="field"><label>Password</label><input name="password" type="password" required></div><button class="btn primary">Login</button></form><p class="muted" style="font-size:12px;margin-top:12px">New customer? Select Register above.</p>`
}
function customerRegisterForm(){
return `<form class="form" onsubmit="event.preventDefault();customerRegister(this)"><div class="row"><div class="field"><label>Full Name</label><input name="name" required></div><div class="field"><label>Mobile / WhatsApp</label><input name="phone" required></div></div><div class="field"><label>Email</label><input name="email" type="email" required></div><div class="field"><label>Password</label><input name="password" type="password" minlength="6" required></div><div class="field"><label>Delivery Address</label><textarea name="address" rows="3" required></textarea></div><button class="btn primary">Submit Registration</button><div class="notice">New accounts require owner approval before the customer can log in.</div></form>`
}
function customerRegister(f){
let email=f.email.value.trim().toLowerCase();
if(state.accounts.some(a=>a.email===email)||state.pendingAccounts.some(a=>a.email===email))return alert("An account or pending registration already exists for this email.");
state.pendingAccounts.push({id:Date.now(),name:f.name.value.trim(),phone:f.phone.value.trim(),email,password:f.password.value,address:f.address.value.trim(),status:"Pending",date:new Date().toISOString()});
save("pendingAccounts",state.pendingAccounts);
alert("Registration submitted. Please wait for owner approval.");
customerAuthMode="login";render()
}
function customerLogin(f){
let identity=f.identity.value.trim().toLowerCase();
let acc=state.accounts.find(a=>(a.email===identity||a.phone===identity)&&a.password===f.password.value);
if(!acc){
let pending=state.pendingAccounts.find(a=>a.email===identity||a.phone===identity);
if(pending)return alert("Your registration is still pending owner approval.");
return alert("Invalid login details.");
}
state.user={email:acc.email,name:acc.name,phone:acc.phone};state.role="customer";state.page="dashboard";render()
}
function appShell(){return `<header class="topbar"><div class="brand"><div class="logo">🌾</div><div>${CONFIG.shopName}</div></div><div class="top-actions"><span class="muted hide-sm">${state.user.name}</span><button class="btn outline" onclick="logout()">Logout</button></div></header><div class="layout"><aside class="side">${nav()}</aside><main class="content">${page()}</main></div>`}
function nav(){let owner=state.role==="owner";let items=owner?[["dashboard","📊 Dashboard"],["products","📦 Products"],["brands","🏷️ Brands & Stock"],["orders","🧾 Orders"],["customers","👥 Customers"],["approvals","✅ Approvals"],["invoices","🧾 Invoices"],["payments","💳 Payments"]]:[["dashboard","🏠 Shop"],["cart","🛒 Cart"],["myorders","📦 My Orders"],["profile","👤 My Account"]];return `<div class="nav">${items.map(([p,t])=>`<button class="${state.page===p?"active":""}" onclick="go('${p}')">${t}</button>`).join("")}</div><div style="margin-top:25px" class="notice">WhatsApp ordering is ready. Configure your WhatsApp number in <b>CONFIG</b>.</div>`}
function page(){if(state.page==="dashboard")return state.role==="owner"?ownerDashboard():customerShop();if(state.page==="products")return productsPage();if(state.page==="orders"||state.page==="myorders")return ordersPage();if(state.page==="customers")return customersPage();if(state.page==="approvals")return approvalsPage();if(state.page==="invoices")return invoicesPage();if(state.page==="payments")return paymentsPage();if(state.page==="cart")return cartPage();if(state.page==="profile")return profilePage();return customerShop()}
function ownerDashboard(){let today=new Date().toISOString().slice(0,10);let todayOrders=state.orders.filter(o=>String(o.date||"").slice(0,10)===today);let todaySales=todayOrders.reduce((a,o)=>a+Number(o.total||0),0);let todayCash=todayOrders.filter(o=>String(o.payment||"").toLowerCase().includes("cash")).reduce((a,o)=>a+Number(o.total||0),0);let todayUpi=todayOrders.filter(o=>{let p=String(o.payment||"").toLowerCase();return p.includes("upi")||p.includes("online")}).reduce((a,o)=>a+Number(o.total||0),0);let pending=state.orders.filter(o=>o.status==="Pending").length;return `<div class="page-head"><div><h1>Owner Dashboard</h1><p class="muted">Today: ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</p></div><button class="btn primary" onclick="openOrder()">+ New Order</button></div><div class="grid stats"><div class="card stat"><div><div class="muted">Today's Sales</div><div class="num">${money(todaySales)}</div><small class="muted">${todayOrders.length} orders today</small></div><div class="iconbox">₹</div></div><div class="card stat"><div><div class="muted">Cash Payment</div><div class="num">${money(todayCash)}</div><small class="muted">Today's cash</small></div><div class="iconbox">💵</div></div><div class="card stat"><div><div class="muted">UPI / Online</div><div class="num">${money(todayUpi)}</div><small class="muted">Today's digital payment</small></div><div class="iconbox">📲</div></div><div class="card stat"><div><div class="muted">Pending Orders</div><div class="num">${pending}</div><small class="muted">All pending</small></div><div class="iconbox">⏳</div></div></div><div class="grid two" style="margin-top:16px"><div class="card"><div class="page-head"><h3>Today's Orders</h3><button class="btn light" onclick="go('orders')">View all</button></div>${ordersTable(todayOrders.slice().reverse())}</div><div class="card"><h3>Quick Actions</h3><div class="grid" style="margin-top:12px"><button class="btn primary" onclick="go('products')">Add / manage products</button><button class="btn light" onclick="openOrder()">Create invoice order</button><button class="btn light" onclick="go('customers')">Manage customers</button></div></div></div>`}
function customerShop(){return `<div class="page-head"><div><h1>Wholesale Rice Store</h1><p class="muted">Order rice in bulk with doorstep delivery.</p></div><button class="btn primary" onclick="go('cart')">🛒 Cart (${state.cart.length})</button></div><div class="grid three">${state.products.filter(p=>p.active!==false).map(p=>`<div class="card"><div class="product"><div><strong>${esc(p.name)}</strong><div class="muted">${esc(p.pack)} · ${p.stock} bags available</div></div><div class="price">${money(p.price)}</div></div><button class="btn primary" style="width:100%;margin-top:18px" onclick="addCart(${p.id})">Add to cart</button></div>`).join("")}</div>`}

function brandsPage(){
  const brands=[...new Set(state.products.filter(p=>p.active!==false).map(p=>p.brand||"Unbranded"))].sort();
  return `<div class="page-head"><div><h1>Brands & Stock</h1><p class="muted">Add, edit, remove brands and manage stock quantities.</p></div>
  <button class="btn primary" onclick="openProductEditor()">+ Add Brand / Product</button></div>
  <div class="grid stats">
    <div class="card stat"><div><div class="muted">Brands</div><div class="num">${brands.length}</div></div><div class="iconbox">🏷️</div></div>
    <div class="card stat"><div><div class="muted">Products</div><div class="num">${state.products.length}</div></div><div class="iconbox">📦</div></div>
    <div class="card stat"><div><div class="muted">Total Bags</div><div class="num">${state.products.reduce((a,p)=>a+Number(p.stock||0),0)}</div></div><div class="iconbox">🌾</div></div>
    <div class="card stat"><div><div class="muted">Low Stock</div><div class="num">${state.products.filter(p=>Number(p.stock||0)<=Number(p.lowStock||10)).length}</div></div><div class="iconbox">⚠️</div></div>
  </div>
  <div class="card table-wrap" style="margin-top:16px"><table class="table"><thead><tr><th>Brand</th><th>Rice / Product</th><th>Pack</th><th>Price</th><th>Stock</th><th>Stock Action</th><th>Manage</th></tr></thead><tbody>
  ${state.products.length?state.products.filter(p=>p.active!==false).map(p=>{
    const low=Number(p.stock||0)<=Number(p.lowStock||10);
    return `<tr><td><b>${esc(p.brand||"Unbranded")}</b></td><td>${esc(p.name||"")}</td><td>${esc(p.pack||p.size||"-")}</td><td>${money(Number(p.price||0))}</td><td><b>${Number(p.stock||0)}</b> ${low?'<span class="badge danger">Low</span>':''}</td><td><button class="btn light" onclick="adjustStock(${p.id},-1)">−</button> <button class="btn light" onclick="adjustStock(${p.id},1)">+</button> <button class="btn light" onclick="setStock(${p.id})">Set</button></td><td><button class="btn light" onclick="openProductEditor(${p.id})">Edit</button> <button class="btn danger" onclick="removeProduct(${p.id})">Remove</button></td></tr>`
  }).join(""):`<tr><td colspan="7" class="muted">No brands/products yet. Add your first rice brand.</td></tr>`}
  </tbody></table></div>`
}

function openProductEditor(id){
  const p=id?state.products.find(x=>x.id===id):null;
  const title=p?"Edit Brand / Product":"Add New Brand / Product";
  const brand=prompt("Brand name:",p?.brand||"");
  if(brand===null)return;
  const name=prompt("Rice/product name:",p?.name||"Basmati Rice");
  if(name===null)return;
  const pack=prompt("Pack size (e.g. 25 kg):",p?.pack||"25 kg");
  if(pack===null)return;
  const price=prompt("Wholesale price per pack:",p?.price??"0");
  if(price===null)return;
  const stock=prompt("Current stock (number of packs/bags):",p?.stock??"0");
  if(stock===null)return;
  const lowStock=prompt("Low-stock alert threshold:",p?.lowStock??"10");
  if(lowStock===null)return;
  if(!brand.trim()||!name.trim()||Number(price)<0||Number(stock)<0)return alert("Please enter valid product details.");
  if(p){
    Object.assign(p,{brand:brand.trim(),name:name.trim(),pack:pack.trim(),price:Number(price),stock:Number(stock),lowStock:Number(lowStock)});
  }else{
    state.products.push({id:Date.now(),brand:brand.trim(),name:name.trim(),pack:pack.trim(),price:Number(price),stock:Number(stock),lowStock:Number(lowStock),active:true});
  }
  save("products",state.products);
  render();
}

function adjustStock(id,delta){
  const p=state.products.find(x=>x.id===id);if(!p)return;
  const next=Math.max(0,Number(p.stock||0)+delta);
  p.stock=next;save("products",state.products);render();
}
function setStock(id){
  const p=state.products.find(x=>x.id===id);if(!p)return;
  const n=prompt(`Set stock for ${p.brand||""} ${p.name||""}:`,p.stock||0);
  if(n===null)return;
  if(Number.isNaN(Number(n))||Number(n)<0)return alert("Invalid stock quantity.");
  p.stock=Number(n);save("products",state.products);render();
}
function removeProduct(id){
  const p=state.products.find(x=>x.id===id);if(!p)return;
  if(!confirm(`Remove ${p.brand||""} ${p.name||""}? It will no longer appear for customers.`))return;
  state.products=state.products.filter(x=>x.id!==id);
  save("products",state.products);render();
}
function productsPage(){return `<div class="page-head"><div><h1>Products & Stock</h1><p class="muted">Manage wholesale prices and inventory.</p></div><button class="btn primary" onclick="openProduct()">+ Add Product</button></div><div class="card table-wrap"><table class="table"><thead><tr><th>Product</th><th>Pack</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead><tbody>${state.products.filter(p=>p.active!==false).map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.pack)}</td><td>${money(p.price)}</td><td>${p.stock}</td><td><button class="btn light" onclick="openProduct(${p.id})">Edit</button></td></tr>`).join("")}</tbody></table></div>`}
function ordersPage(){let list=state.role==="owner"?state.orders:state.orders.filter(o=>o.customer===state.user.email);return `<div class="page-head"><div><h1>${state.role==="owner"?"Orders":"My Orders"}</h1><p class="muted">Track order, delivery and payment status.</p></div></div><div class="card table-wrap">${ordersTable(list.slice().reverse())}</div>`}
function ordersTable(list){if(!list.length)return `<p class="muted">No orders yet.</p>`;return `<table class="table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Action</th></tr></thead><tbody>${list.map(o=>`<tr><td><b>#${o.id}</b><div class="muted">${new Date(o.date).toLocaleDateString()}</div></td><td>${esc(o.customerName||o.customer)}</td><td>${money(o.total)}</td><td>${esc(o.payment)}</td><td><span class="badge ${o.status==="Pending"?"pending":""}">${o.status}</span></td><td><button class="btn light" onclick="viewOrder('${o.id}')">View</button></td></tr>`).join("")}</tbody></table>`}
function approvalsPage(){
return `<div class="page-head"><div><h1>Customer Approvals</h1><p class="muted">Review new customer registrations before they can log in.</p></div></div>
<div class="card table-wrap"><table class="table"><thead><tr><th>Customer</th><th>Contact</th><th>Address</th><th>Registered</th><th>Status</th><th>Action</th></tr></thead><tbody>
${state.pendingAccounts.length?state.pendingAccounts.map(a=>`<tr><td><b>${esc(a.name)}</b><div class="muted">${esc(a.email)}</div></td><td>${esc(a.phone)}</td><td>${esc(a.address)}</td><td>${new Date(a.date).toLocaleDateString()}</td><td><span class="badge pending">${a.status}</span></td><td><button class="btn primary" onclick="approveCustomer(${a.id})">Approve</button> <button class="btn danger" onclick="rejectCustomer(${a.id})">Reject</button></td></tr>`).join(""):`<tr><td colspan="6" class="muted">No pending registrations.</td></tr>`}
</tbody></table></div>`
}
function approveCustomer(id){
let a=state.pendingAccounts.find(x=>x.id===id);if(!a)return;
state.accounts.push({id:a.id,name:a.name,phone:a.phone,email:a.email,password:a.password,address:a.address,status:"Approved",approvedAt:new Date().toISOString()});
state.customers.push({name:a.name,email:a.email,phone:a.phone,address:a.address});
state.pendingAccounts=state.pendingAccounts.filter(x=>x.id!==id);
save("accounts",state.accounts);save("customers",state.customers);save("pendingAccounts",state.pendingAccounts);
alert(`${a.name} approved. They can now log in.`);render()
}
function rejectCustomer(id){
let a=state.pendingAccounts.find(x=>x.id===id);if(!a)return;
state.pendingAccounts=state.pendingAccounts.filter(x=>x.id!==id);
save("pendingAccounts",state.pendingAccounts);
alert("Registration rejected.");render()
}
function customersPage(){return `<div class="page-head"><div><h1>Customers</h1><p class="muted">Customer records and delivery contacts.</p></div><button class="btn primary" onclick="openCustomer()">+ Add Customer</button></div><div class="card table-wrap"><table class="table"><thead><tr><th>Name</th><th>Phone</th><th>Address</th><th>Orders</th></tr></thead><tbody>${state.customers.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${esc(c.address)}</td><td>${state.orders.filter(o=>o.customer===c.email).length}</td></tr>`).join("")}</tbody></table></div>`}
function invoicesPage(){return `<div class="page-head"><div><h1>Invoices</h1><p class="muted">Generate and print customer bills.</p></div></div><div class="card table-wrap"><table class="table"><thead><tr><th>Invoice</th><th>Order</th><th>Customer</th><th>Amount</th><th>Action</th></tr></thead><tbody>${state.invoices.map(i=>`<tr><td>${i.id}</td><td>#${i.order}</td><td>${esc(i.customer)}</td><td>${money(i.total)}</td><td><button class="btn light" onclick="printInvoice('${i.id}')">Print / PDF</button></td></tr>`).join("")}</tbody></table></div>`}
function paymentsPage(){let paid=state.orders.filter(o=>o.paymentStatus==="Paid").reduce((a,o)=>a+o.total,0),due=state.orders.filter(o=>o.paymentStatus!=="Paid").reduce((a,o)=>a+o.total,0);return `<div class="page-head"><div><h1>Payments</h1><p class="muted">Online, cash and pending collection overview.</p></div></div><div class="grid three"><div class="card"><div class="muted">Collected</div><div class="num">${money(paid)}</div></div><div class="card"><div class="muted">Pending</div><div class="num">${money(due)}</div></div><div class="card"><div class="muted">Online/Cash</div><div class="num">${state.orders.length}</div></div></div><div class="card" style="margin-top:16px">${ordersTable(state.orders)}</div>`}
function cartPage(){let total=state.cart.reduce((a,x)=>a+x.price*x.qty,0);return `<div class="page-head"><div><h1>Your Cart</h1><p class="muted">Confirm quantity and delivery details.</p></div><button class="btn light" onclick="go('dashboard')">Continue shopping</button></div><div class="grid two"><div class="card">${state.cart.length?state.cart.map(x=>`<div class="cart-line"><div><b>${esc(x.name)}</b><div class="muted">${money(x.price)} × ${x.qty}</div></div><div><button class="btn light" onclick="changeQty(${x.id},-1)">−</button> <button class="btn light" onclick="changeQty(${x.id},1)">+</button></div></div>`).join(""):`<p class="muted">Your cart is empty.</p>`}</div><div class="card"><h3>Checkout</h3><div class="total"><span>Total</span><span>${money(total)}</span></div><button class="btn primary" style="width:100%;margin-top:18px" onclick="checkout()">Place Order</button><button class="btn gold" style="width:100%;margin-top:10px" onclick="whatsappCart()">Order via WhatsApp</button><p class="muted" style="font-size:12px;margin-top:12px">Online payment integration requires your payment gateway credentials on a secure backend. Cash on delivery is supported in this demo.</p></div></div>`}
function profilePage(){return `<div class="page-head"><div><h1>My Account</h1><p class="muted">Delivery contact information</p></div></div><div class="card form" style="max-width:650px"><div class="field"><label>Name</label><input id="pname" value="${esc(state.user.name==="Customer"?"":state.user.name)}"></div><div class="field"><label>Phone / WhatsApp</label><input id="pphone" placeholder="10 digit mobile"></div><div class="field"><label>Delivery Address</label><textarea id="paddress" rows="3" placeholder="Full delivery address"></textarea></div><button class="btn primary" onclick="saveProfile()">Save details</button></div>`}
function addCart(id){let p=state.products.find(x=>x.id===id),x=state.cart.find(x=>x.id===id);if(x)x.qty++;else state.cart.push({id:p.id,name:p.name,price:p.price,qty:1});save("cart",state.cart);render()}
function changeQty(id,d){let x=state.cart.find(x=>x.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)state.cart=state.cart.filter(y=>y.id!==id);save("cart",state.cart);render()}
function checkout(){if(!state.cart.length)return alert("Cart is empty");openCheckout()}
function whatsappCart(){if(!state.cart.length)return alert("Cart is empty");let text="Hello "+CONFIG.shopName+"%0A%0AI want to order:%0A"+state.cart.map(x=>`${x.name} - ${x.qty} × ${money(x.price)}`).join("%0A")+"%0A%0ATotal: "+money(state.cart.reduce((a,x)=>a+x.price*x.qty,0));window.open(`https://wa.me/${CONFIG.phone}?text=${text}`,"_blank")}
function modal(title,body){document.body.insertAdjacentHTML("beforeend",`<div class="modal" id="modal"><div class="modalbox"><div class="modalhead"><h2>${title}</h2><button class="close" onclick="closeModal()">×</button></div>${body}</div></div>`)}
function closeModal(){document.getElementById("modal")?.remove()}
function openProduct(id){let p=id?state.products.find(x=>x.id===id):{name:"",pack:"25 kg",price:0,stock:0};modal(id?"Edit Product":"Add Product",`<form class="form" onsubmit="event.preventDefault();saveProduct(${id||0},this)"><div class="field"><label>Product name</label><input name="name" value="${esc(p.name)}" required></div><div class="row"><div class="field"><label>Pack size</label><input name="pack" value="${esc(p.pack)}"></div><div class="field"><label>Price</label><input name="price" type="number" step=".01" value="${p.price}"></div></div><div class="field"><label>Stock (bags)</label><input name="stock" type="number" value="${p.stock}"></div><button class="btn primary">Save Product</button></form>`)}
function saveProduct(id,f){let obj={id:id||Date.now(),name:f.name.value,pack:f.pack.value,price:+f.price.value,stock:+f.stock.value};if(id)state.products=state.products.filter(p=>p.active!==false).map(p=>p.id===id?obj:p);else state.products.push(obj);save("products",state.products);closeModal();render()}
function openCustomer(){modal("Add Customer",`<form class="form" onsubmit="event.preventDefault();let c={name:this.name.value,email:this.email.value,phone:this.phone.value,address:this.address.value};state.customers.push(c);save('customers',state.customers);closeModal();render()"><div class="row"><div class="field"><label>Name</label><input name="name" required></div><div class="field"><label>Email</label><input name="email" type="email"></div></div><div class="field"><label>WhatsApp / Phone</label><input name="phone" required></div><div class="field"><label>Address</label><textarea name="address" rows="3"></textarea></div><button class="btn primary">Save Customer</button></form>`)}
function openOrder(){modal("Create Order",`<form class="form" onsubmit="event.preventDefault();createManualOrder(this)"><div class="row"><div class="field"><label>Customer name</label><input name="customerName" required></div><div class="field"><label>Phone / WhatsApp</label><input name="phone" required></div></div><div class="field"><label>Delivery address</label><textarea name="address" rows="2"></textarea></div><div class="field"><label>Amount</label><input name="total" type="number" step=".01" required></div><div class="row"><div class="field"><label>Payment</label><select name="payment"><option>Cash</option><option>UPI</option><option>Online</option><option>Credit</option></select></div><div class="field"><label>Status</label><select name="status"><option>Pending</option><option>Confirmed</option><option>Delivered</option></select></div></div><button class="btn primary">Create Order & Invoice</button></form>`)}
function createManualOrder(f){let o={id:String(Date.now()).slice(-7),customer:f.phone.value,customerName:f.customerName.value,total:+f.total.value,payment:f.payment.value,status:f.status.value,paymentStatus:f.payment.value==="Cash"?"Pending":"Paid",date:new Date().toISOString(),items:[]};state.orders.push(o);state.invoices.push({id:"INV-"+o.id,order:o.id,customer:o.customerName,total:o.total,date:o.date});save("orders",state.orders);save("invoices",state.invoices);closeModal();go("orders")}
function openCheckout(){let total=state.cart.reduce((a,x)=>a+x.price*x.qty,0);modal("Confirm Delivery & Payment",`<form class="form" onsubmit="event.preventDefault();placeCustomerOrder(this)"><div class="field"><label>Full name</label><input name="name" required></div><div class="field"><label>WhatsApp phone</label><input name="phone" required></div><div class="field"><label>Doorstep delivery address</label><textarea name="address" rows="3" required></textarea></div><div class="field"><label>Payment method</label><select name="payment"><option>Cash on Delivery</option><option>UPI / Online</option></select></div><div class="total"><span>Payable</span><span>${money(total)}</span></div><button class="btn primary">Confirm Order</button></form>`)}
function placeCustomerOrder(f){let total=state.cart.reduce((a,x)=>a+x.price*x.qty,0),o={id:String(Date.now()).slice(-7),customer:state.user.email,customerName:f.name.value,phone:f.phone.value,address:f.address.value,total,payment:f.payment.value,status:"Pending",paymentStatus:"Pending",date:new Date().toISOString(),items:state.cart};state.orders.push(o);state.invoices.push({id:"INV-"+o.id,order:o.id,customer:o.customerName,total,date:o.date});state.cart=[];save("orders",state.orders);save("invoices",state.invoices);save("cart",state.cart);closeModal();alert("Order placed successfully. The shop can confirm delivery from the owner panel.");go("myorders")}
function viewOrder(id){let o=state.orders.find(x=>x.id===id);modal("Order #"+o.id,`<div class="grid"><div><b>Customer:</b> ${esc(o.customerName)}</div><div><b>Phone:</b> ${esc(o.phone||o.customer)}</div><div><b>Address:</b> ${esc(o.address||"—")}</div><div><b>Total:</b> ${money(o.total)}</div><div><b>Payment:</b> ${esc(o.payment)} · ${esc(o.paymentStatus)}</div><div><b>Status:</b> ${esc(o.status)}</div><div class="row"><button class="btn gold" onclick="sendOrderWhatsApp('${o.id}')">WhatsApp Customer</button>${state.role==="owner"?`<button class="btn primary" onclick="markDelivered('${o.id}')">Mark Delivered</button>`:""}</div></div>`)}
function sendOrderWhatsApp(id){let o=state.orders.find(x=>x.id===id),phone=(o.phone||"").replace(/\D/g,"");if(!phone)return alert("Customer phone not available");let text=`Hello ${o.customerName}, your order #${o.id} from ${CONFIG.shopName} is ${o.status}. Total: ${money(o.total)}. Thank you!`;window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,"_blank")}
function markDelivered(id){let o=state.orders.find(x=>x.id===id);o.status="Delivered";save("orders",state.orders);closeModal();render()}
function printInvoice(id){let i=state.invoices.find(x=>x.id===id);let o=state.orders.find(x=>x.id===i.order);let items=(o.items||[]).map(x=>`<tr><td>${esc(x.name)}</td><td>${x.qty}</td><td>${money(x.price)}</td><td>${money(x.price*x.qty)}</td></tr>`).join("");let w=window.open("","_blank");w.document.write(`<html><head><title>${i.id}</title><style>body{font:14px Arial;padding:30px}.invoice-head{display:flex;justify-content:space-between;border-bottom:2px solid #222;padding-bottom:15px}table{width:100%;border-collapse:collapse;margin-top:25px}td,th{padding:10px;border-bottom:1px solid #ddd;text-align:left}.total{text-align:right;font-size:20px;font-weight:bold;margin-top:20px}</style></head><body><div class="invoice-head"><div><h1>${CONFIG.shopName}</h1><div>${CONFIG.address}</div></div><div><h2>${i.id}</h2><div>${new Date(i.date).toLocaleString()}</div></div></div><p><b>Bill To:</b> ${esc(o.customerName)}<br>${esc(o.address||"")}<br>${esc(o.phone||"")}</p><table><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>${items||`<tr><td>Wholesale order</td><td>1</td><td>${money(o.total)}</td><td>${money(o.total)}</td></tr>`}</table><div class="total">Grand Total: ${money(o.total)}</div><p>Payment: ${esc(o.payment)} · ${esc(o.paymentStatus)}</p><script>window.print()<\/script></body></html>`);w.document.close()}
function saveProfile(){alert("Customer details saved for this demo session. Connect a backend for permanent multi-device accounts.")}
render();

function backupData(){
 const payload={
   products:state.products,orders:state.orders,customers:state.customers,
   invoices:state.invoices,accounts:state.accounts,pendingAccounts:state.pendingAccounts,
   exportedAt:new Date().toISOString()
 };
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
 const a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download="rice-shop-backup-"+new Date().toISOString().slice(0,10)+".json";
 a.click();
 URL.revokeObjectURL(a.href);
}

function deductOrderStock(items){
  (items||[]).forEach(item=>{
    const p=state.products.find(x=>x.id===item.id);
    if(p){
      p.stock=Math.max(0,Number(p.stock||0)-Number(item.qty||item.quantity||1));
    }
  });
  save("products",state.products);
}

function checkStockAvailable(items){
  for(const item of (items||[])){
    const p=state.products.find(x=>x.id===item.id);
    const qty=Number(item.qty||item.quantity||1);
    if(p && Number(p.stock||0)<qty){
      alert(`Not enough stock for ${p.brand||""} ${p.name||""}. Available: ${p.stock||0}`);
      return false;
    }
  }
  return true;
}

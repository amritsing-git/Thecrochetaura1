const $=s=>document.querySelector(s);
const get=(k,d=[])=>JSON.parse(localStorage.getItem(k)||JSON.stringify(d));
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const money=n=>'₹'+Number(n).toLocaleString('en-IN');

let selectedImages=[];

function adminToast(msg){
 let t=$('#adminToast');
 if(!t){t=document.createElement('div');t.id='adminToast';t.className='toast';document.body.append(t)}
 t.textContent=msg;setTimeout(()=>t.remove(),2500);
}

function previewFiles(input){
 let files=[...input.files].slice(0,3);
 selectedImages=[];
 $('#imagePreview').innerHTML='';
 files.forEach((file,i)=>{
 let reader=new FileReader();
 reader.onload=()=>{
 selectedImages[i]=reader.result;
 showPreviews();
 };
 reader.readAsDataURL(file);
 });
 if(input.files.length>3)adminToast('Maximum 3 photos allowed');
}

function showPreviews(){
 $('#imagePreview').innerHTML=selectedImages.map((src,i)=>`
 <div class="upload-tile"><img src="${src}">
 <button type="button" onclick="removeImage(${i})">×</button></div>`).join('')+
 `<label class="upload-tile" for="productPhotos"><span style="font-size:35px">＋</span></label>`;
}

function removeImage(i){
 selectedImages.splice(i,1);showPreviews();
}

function saveProduct(e){
 e.preventDefault();
 let p={
 id:Date.now().toString(),
 name:$('#pname').value,
 price:Number($('#pprice').value),
 category:$('#pcategory').value,
 stock:Number($('#pstock').value),
 description:$('#pdesc').value,
 images:selectedImages
 };
 let a=get('products');a.unshift(p);set('products',a);
 adminToast('Product added successfully ♡');
 setTimeout(()=>location.reload(),700);
}

function renderAdmin(){
 let p=get('products'),o=get('orders'),r=get('customRequests');
 if($('#statProducts'))$('#statProducts').textContent=p.length;
 if($('#statOrders'))$('#statOrders').textContent=o.length;
 if($('#statRequests'))$('#statRequests').textContent=r.length;

 if($('#adminProducts'))$('#adminProducts').innerHTML=p.length?p.map(x=>`
 <tr><td>${x.name}</td><td>${x.category}</td><td>${money(x.price)}</td><td>${x.stock}</td>
 <td><button onclick="deleteProduct('${x.id}')">Delete</button></td></tr>`).join(''):
 '<tr><td colspan="5">No products added.</td></tr>';

 if($('#adminOrders'))$('#adminOrders').innerHTML=o.length?o.map(x=>`
 <tr><td>#${x.id}</td><td>${x.name}</td><td>${money(x.total)}</td>
 <td><span class="status">${x.status}</span></td>
 <td><select onchange="updateOrder('${x.id}',this.value)">
 <option value="Order Successfully Placed" ${x.status==='Order Successfully Placed'?'selected':''}>Placed</option>
 <option value="Order Confirmed">Confirm Order</option>
 <option value="Shipped Successfully">Shipped Successfully</option>
 <option value="Out for Delivery">Out for Delivery</option>
 <option value="Delivered">Delivered</option>
 <option value="Cancelled">Cancelled</option>
 </select></td></tr>`).join(''):
 '<tr><td colspan="5">No orders received.</td></tr>';

 if($('#adminRequests'))$('#adminRequests').innerHTML=r.length?r.map(x=>`
 <div class="order-card"><b>${x.name} · ${x.kind}</b>
 <p>${x.details}</p><p>${x.email} · ${x.color||''} · ${x.budget||''}</p></div>`).join(''):
 '<p>No custom requests yet.</p>';
}

function deleteProduct(id){
 set('products',get('products').filter(x=>x.id!==id));renderAdmin();
}

function updateOrder(id,status){
 let o=get('orders').map(x=>x.id===id?{...x,status}:x);
 set('orders',o);renderAdmin();adminToast('Order status updated');
}

document.addEventListener('DOMContentLoaded',()=>{
 renderAdmin();
 if($('#productPhotos'))$('#productPhotos').onchange=()=>previewFiles($('#productPhotos'));
 if($('#productForm'))$('#productForm').onsubmit=saveProduct;

 $('#adminLogin')?.addEventListener('submit',e=>{
 e.preventDefault();
 if($('#adminPassword').value==='crochetaura123'){
 sessionStorage.setItem('adminLoggedIn','yes');
 $('#adminLoginWrap').classList.add('hidden');
 $('#adminApp').classList.remove('hidden');
 }else adminToast('Incorrect password');
 });

 if(sessionStorage.getItem('adminLoggedIn')==='yes'){
 $('#adminLoginWrap')?.classList.add('hidden');
 $('#adminApp')?.classList.remove('hidden');
 }
});
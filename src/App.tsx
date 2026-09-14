import { useEffect, useMemo, useState } from "react";
import {
  BarChart3, Banknote, CheckCircle2, ChevronRight, ClipboardList, Droplets,
  Download, Eye, EyeOff, FileText, LayoutDashboard, LogOut, Menu, Package,
  Pencil, Plus, Search, Settings as SettingsIcon, Store, Trash2, Wallet, X
} from "lucide-react";
import type { AppData, Payment, Product, Shop, Supply, SupplyItem } from "./types";
import { isLoggedIn, loadData, saveData, setLoggedIn } from "./storage";
import { dateLabel, dayPayments, daySupply, downloadCsv, exportAll, money, shopBalance, today } from "./utils";

type Page = "dashboard" | "shops" | "supply" | "collection" | "transactions" | "outstanding" | "reports" | "products" | "settings";

const nav: {id: Page; label: string; icon: typeof LayoutDashboard}[] = [
  {id:"dashboard",label:"Dashboard",icon:LayoutDashboard},
  {id:"shops",label:"Shops",icon:Store},
  {id:"supply",label:"Morning Supply",icon:Droplets},
  {id:"collection",label:"Evening Collection",icon:Banknote},
  {id:"transactions",label:"Transactions",icon:ClipboardList},
  {id:"outstanding",label:"Outstanding",icon:Wallet},
  {id:"reports",label:"Reports",icon:BarChart3},
  {id:"products",label:"Products",icon:Package},
  {id:"settings",label:"Settings",icon:SettingsIcon},
];

function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}) {
  return <div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}><X size={20}/></button></div>{children}</div>
  </div>
}

function Login({onLogin}:{onLogin:()=>void}) {
  const [user,setUser]=useState(""); const [pass,setPass]=useState(""); const [show,setShow]=useState(false); const [error,setError]=useState("");
  const submit=(e:React.FormEvent)=>{e.preventDefault(); if(user==="Water"&&pass==="Bottle"){setLoggedIn(true);onLogin()}else setError("Incorrect username or password.")};
  return <div className="login-page"><div className="login-card">
    <div className="brand-mark"><Droplets size={30}/></div><h1>Water Business Manager</h1><p className="muted">Sign in to manage your daily supply and collections.</p>
    <form onSubmit={submit}><label>Username<input value={user} onChange={e=>setUser(e.target.value)} placeholder="Enter username" autoComplete="username"/></label>
    <label>Password<div className="password-wrap"><input type={show?"text":"password"} value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter password" autoComplete="current-password"/><button type="button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
    {error&&<div className="error">{error}</div>}<button className="primary full" type="submit">Login</button></form>
  </div></div>
}

export default function App(){
  const [logged,setLogged]=useState(isLoggedIn()); const [data,setData]=useState<AppData>(loadData()); const [page,setPage]=useState<Page>("dashboard"); const [mobile,setMobile]=useState(false);
  useEffect(()=>saveData(data),[data]);
  useEffect(()=>{document.documentElement.dataset.theme=data.settings.darkMode?"dark":"light"},[data.settings.darkMode]);
  if(!logged)return <Login onLogin={()=>setLogged(true)}/>;
  const update=(patch:Partial<AppData>)=>setData(d=>({...d,...patch}));
  const logout=()=>{setLoggedIn(false);setLogged(false)};
  const common={data,setData,update,money:(n:number)=>money(n,data.settings.currency)};
  return <div className="app">
    <aside className={`sidebar ${mobile?"open":""}`}><div className="side-brand"><div className="mini-mark"><Droplets size={20}/></div><div><b>Water Manager</b><small>Business Bookkeeping</small></div></div>
      <nav>{nav.map(n=><button key={n.id} className={page===n.id?"active":""} onClick={()=>{setPage(n.id);setMobile(false)}}><n.icon size={19}/><span>{n.label}</span></button>)}</nav>
      <button className="logout" onClick={logout}><LogOut size={18}/>Logout</button>
    </aside>
    {mobile&&<div className="scrim" onClick={()=>setMobile(false)}/>}
    <main className="main"><header><button className="mobile-menu icon-btn" onClick={()=>setMobile(true)}><Menu/></button><div><h1>{nav.find(n=>n.id===page)?.label}</h1><p>{dateLabel(today())}</p></div><div className="header-business">{data.settings.businessName}</div></header>
      <div className="content">
      {page==="dashboard"&&<Dashboard {...common} go={setPage}/>}
      {page==="shops"&&<Shops {...common}/>}
      {page==="supply"&&<SupplyPage {...common}/>}
      {page==="collection"&&<Collection {...common}/>}
      {page==="transactions"&&<Transactions {...common}/>}
      {page==="outstanding"&&<Outstanding {...common}/>}
      {page==="reports"&&<Reports {...common}/>}
      {page==="products"&&<Products {...common}/>}
      {page==="settings"&&<SettingsPage {...common}/>}
      </div>
    </main>
  </div>
}

function Dashboard({data,go,money}:{data:AppData;go:(p:Page)=>void;money:(n:number)=>string}) {
  const d=today(), supplied=daySupply(data,d), collected=dayPayments(data,d), outstanding=data.shops.reduce((a,s)=>a+Math.max(0,shopBalance(data,s.id)),0);
  return <><div className="stats">
    <Stat icon={Store} label="Total Shops" value={String(data.shops.length)}/><Stat icon={Droplets} label="Today's Supply" value={money(supplied)}/><Stat icon={Banknote} label="Collected Today" value={money(collected)}/><Stat icon={Wallet} label="Outstanding" value={money(outstanding)}/>
  </div>
  <div className="quick-grid"><button onClick={()=>go("shops")}><Plus/><b>Add Shop</b><span>Add a new customer/shop</span></button><button onClick={()=>go("supply")}><Droplets/><b>Morning Supply</b><span>Record today's delivery</span></button><button onClick={()=>go("collection")}><Banknote/><b>Evening Collection</b><span>Record payments</span><ChevronRight/></button><button onClick={()=>go("outstanding")}><Wallet/><b>Outstanding</b><span>See pending balances</span></button></div>
  <div className="two-col"><div className="panel"><div className="panel-head"><h2>Today's activity</h2><button className="text-btn" onClick={()=>go("transactions")}>View all</button></div>
    {data.shops.length===0?<Empty text="No shops yet. Add your first shop to start."/>:<div className="mini-list">{data.shops.slice(0,7).map(s=>{const due=Math.max(0,shopBalance(data,s.id));return <div className="mini-row" key={s.id}><div className="avatar">{s.name.charAt(0).toUpperCase()}</div><div><b>{s.name}</b><small>{due>0?`Balance ${money(due)}`:"Up to date"}</small></div><span className={due>0?"status pending":"status paid"}>{due>0?"PENDING":"PAID"}</span></div>})}</div>}
  </div><div className="panel"><div className="panel-head"><h2>Business snapshot</h2></div><div className="snapshot"><div><span>Active products</span><b>{data.products.filter(p=>p.active).length}</b></div><div><span>Shops with balance</span><b>{data.shops.filter(s=>shopBalance(data,s.id)>0).length}</b></div><div><span>Payments today</span><b>{data.payments.filter(p=>p.date===d).length}</b></div></div></div></div></>
}

function Stat({icon:Icon,label,value}:{icon:any;label:string;value:string}){return <div className="stat"><div className="stat-icon"><Icon size={21}/></div><div><span>{label}</span><b>{value}</b></div></div>}
function Empty({text}:{text:string}){return <div className="empty"><FileText size={28}/><p>{text}</p></div>}

function Shops({data,setData,money}:{data:AppData;setData:React.Dispatch<React.SetStateAction<AppData>>;money:(n:number)=>string}) {
  const [search,setSearch]=useState(""); const [edit,setEdit]=useState<Shop|null>(null); const [add,setAdd]=useState(false);
  const list=data.shops.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));
  const remove=(id:string)=>{if(confirm("Delete this shop? Existing transaction history will also be removed."))setData(d=>({...d,shops:d.shops.filter(s=>s.id!==id),supplies:d.supplies.filter(s=>s.shopId!==id),payments:d.payments.filter(p=>p.shopId!==id)}))};
  return <><div className="toolbar"><div className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search shops..."/></div><button className="primary" onClick={()=>setAdd(true)}><Plus size={18}/> Add Shop</button></div>
  <div className="panel table-panel">{list.length===0?<Empty text="No shops found."/>:<table><thead><tr><th>Shop</th><th>Balance</th><th>Status</th><th></th></tr></thead><tbody>{list.map(s=>{const b=shopBalance(data,s.id);return <tr key={s.id}><td><b>{s.name}</b><small>{s.area||s.address||"—"}</small></td><td><b>{money(Math.max(0,b))}</b></td><td><span className={`status ${b>0?"pending":"paid"}`}>{b>0?"PENDING":"CLEAR"}</span></td><td><div className="row-actions"><button className="icon-btn" title="Edit" onClick={()=>setEdit(s)}><Pencil size={16}/></button><button className="icon-btn danger" title="Delete" onClick={()=>remove(s.id)}><Trash2 size={16}/></button></div></td></tr>})}</tbody></table>}</div>
  {(add||edit)&&<ShopModal shop={edit} balance={edit?shopBalance(data,edit.id):0} transactionBalance={edit?shopBalance(data,edit.id)-(edit.openingBalance||0):0} onClose={()=>{setAdd(false);setEdit(null)}} onSave={s=>{setData(d=>({...d,shops:edit?d.shops.map(x=>x.id===s.id?s:x):[...d.shops,s]}));setAdd(false);setEdit(null)}}/>}</>
}

function ShopModal({shop,balance,transactionBalance,onClose,onSave}:{shop:Shop|null;balance:number;transactionBalance:number;onClose:()=>void;onSave:(s:Shop)=>void}) {
  const [f,setF]=useState<Shop>(shop||{id:crypto.randomUUID(),name:"",openingBalance:0,owner:"",phone:"",address:"",area:"",notes:"",active:true,createdAt:new Date().toISOString()});
  const [balanceValue,setBalanceValue]=useState(String(balance));
  const set=(k:keyof Shop,v:any)=>setF(x=>({...x,[k]:v}));
  const save=()=>onSave({...f,openingBalance:(Number(balanceValue)||0)-transactionBalance});
  return <Modal title={shop?"Edit Shop":"Add Shop"} onClose={onClose}><div className="form-grid"><label>Shop Name *<input value={f.name} onChange={e=>set("name",e.target.value)}/></label><label>Balance<input type="number" min="0" step="0.01" value={balanceValue} onChange={e=>setBalanceValue(e.target.value)}/></label><label className="wide">Notes<textarea value={f.notes} onChange={e=>set("notes",e.target.value)}/></label></div><div className="tip"><p>Balance can be adjusted here. Daily supply and collection are entered in Evening Collection.</p></div><div className="modal-actions"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={!f.name.trim()} onClick={save}>Save Shop</button></div></Modal>
}

function SupplyPage({data,setData,money}:{data:AppData;setData:React.Dispatch<React.SetStateAction<AppData>>;money:(n:number)=>string}) {
  const [date,setDate]=useState(today()),[shopId,setShopId]=useState(""),[items,setItems]=useState<SupplyItem[]>([]),[notes,setNotes]=useState("");
  const active=data.products.filter(p=>p.active); const total=items.reduce((a,i)=>a+i.total,0);
  const addItem=()=>{if(active[0])setItems(a=>[...a,{productId:active[0].id,productName:active[0].name,quantity:1,price:active[0].price,total:active[0].price}])};
  const change=(idx:number,key:string,val:any)=>setItems(a=>a.map((i,n)=>{if(n!==idx)return i;const x={...i,[key]:val}; if(key==="productId"){const p=active.find(p=>p.id===val);if(p){x.productName=p.name;x.price=p.price}} x.total=Number(x.quantity)*Number(x.price);return x}));
  const save=()=>{if(!shopId||!items.length)return alert("Select a shop and add at least one product.");const s:Supply={id:crypto.randomUUID(),shopId,date,items,total,notes,createdAt:new Date().toISOString()};setData(d=>({...d,supplies:[...d.supplies,s]}));setItems([]);setNotes("");alert("Supply recorded successfully.")};
  return <div className="panel form-panel"><div className="form-grid"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Shop<select value={shopId} onChange={e=>setShopId(e.target.value)}><option value="">Select shop</option>{data.shops.filter(s=>s.active).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div>
  <div className="section-title"><h2>Products supplied</h2><button className="secondary" onClick={addItem} disabled={!active.length}><Plus size={17}/> Add product</button></div>
  {items.length===0?<Empty text="Add the water cans, bottles or juice supplied this morning."/>:<div className="items">{items.map((i,idx)=><div className="item-row" key={idx}><select value={i.productId} onChange={e=>change(idx,"productId",e.target.value)}>{active.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><input type="number" min="1" value={i.quantity} onChange={e=>change(idx,"quantity",Number(e.target.value))}/><input type="number" min="0" step="0.01" value={i.price} onChange={e=>change(idx,"price",Number(e.target.value))}/><b>{money(i.total)}</b><button className="icon-btn danger" onClick={()=>setItems(a=>a.filter((_,n)=>n!==idx))}><Trash2 size={16}/></button></div>)}</div>}
  <label className="notes">Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional delivery note"/></label><div className="total-box"><span>Total supply</span><strong>{money(total)}</strong></div><button className="primary" onClick={save}><CheckCircle2 size={18}/> Save Supply</button></div>
}

function Collection({data,setData,money}:{data:AppData;setData:React.Dispatch<React.SetStateAction<AppData>>;money:(n:number)=>string}) {
  const [date,setDate]=useState(today()),[shopId,setShopId]=useState(""),[supplyAmount,setSupplyAmount]=useState(""),[amount,setAmount]=useState(""),[method,setMethod]=useState("Cash"),[notes,setNotes]=useState("");
  const balance=shopId?Math.max(0,shopBalance(data,shopId,date)):0; const supply=Number(supplyAmount)||0; const pay=Number(amount)||0; const after=Math.max(0,balance+supply-pay); const over=Math.max(0,pay-(balance+supply));
  const save=()=>{if(!shopId||supply<=0&&pay<=0)return alert("Select a shop and enter a supply or collection amount.");const p:Payment|undefined=pay>0?{id:crypto.randomUUID(),shopId,date,amount:pay,method,notes,createdAt:new Date().toISOString()}:undefined;setData(d=>({...d,shops:d.shops.map(s=>s.id===shopId?{...s,openingBalance:(s.openingBalance||0)+supply}:s),payments:p?[...d.payments,p]:d.payments}));setSupplyAmount("");setAmount("");setNotes("");alert("Evening collection saved successfully.")};
  return <div className="two-col"><div className="panel form-panel"><h2>Record evening collection</h2><p className="muted">Enter today's supply and collection together. The remaining balance carries forward automatically.</p><div className="form-grid"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Shop<select value={shopId} onChange={e=>setShopId(e.target.value)}><option value="">Select shop</option>{data.shops.filter(s=>s.active).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Supply Amount<input type="number" min="0" step="0.01" value={supplyAmount} onChange={e=>setSupplyAmount(e.target.value)} placeholder="0"/></label><label>Collected Today<input type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0"/></label><label>Payment Method<select value={method} onChange={e=>setMethod(e.target.value)}><option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Other</option></select></label><label className="wide">Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)}/></label></div><button className="primary" onClick={save}><Banknote size={18}/> Save Collection</button></div>
  <div className="panel collection-summary"><h2>Payment summary</h2><div className="balance-card"><div className="summary-balance"><span>Balance</span><b>{money(balance)}</b></div><div className="summary-supply"><span>Supply Amount</span><b>{money(supply)}</b></div><div className="summary-collected"><span>Collected Today</span><b>{money(pay)}</b></div><div className="summary-remaining"><span>Remaining Balance</span><b>{money(after)}</b></div>{over>0&&<div className="credit"><span>Advance / credit</span><b>{money(over)}</b></div>}</div><div className="tip"><b>Today's calculation</b><p>Balance + supply amount − collected today = remaining balance.</p></div></div></div>
}

function Transactions({data,money}:{data:AppData;money:(n:number)=>string}) {
  const [search,setSearch]=useState("");const shops=new Map(data.shops.map(s=>[s.id,s.name]));
  const rows=[...data.supplies.flatMap(s=>[{id:s.id,type:"Supply",date:s.date,shop:shops.get(s.shopId)||"Deleted shop",amount:s.total,detail:s.items.map(i=>`${i.productName} × ${i.quantity}`).join(", "),method:""}]),...data.payments.map(p=>({id:p.id,type:"Payment",date:p.date,shop:shops.get(p.shopId)||"Deleted shop",amount:p.amount,detail:p.notes||"Payment collected",method:p.method}))].filter(r=>(r.shop+" "+r.detail+" "+r.type).toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date));
  return <><div className="toolbar"><div className="search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions..."/></div></div><div className="panel table-panel"><table><thead><tr><th>Date</th><th>Type</th><th>Shop</th><th>Details</th><th>Method</th><th>Amount</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{dateLabel(r.date)}</td><td><span className={`status ${r.type==="Payment"?"paid":"supply"}`}>{r.type}</span></td><td><b>{r.shop}</b></td><td>{r.detail}</td><td>{r.method||"—"}</td><td><b>{money(r.amount)}</b></td></tr>)}</tbody></table>{rows.length===0&&<Empty text="No transactions found."/>}</div></>
}

function Outstanding({data,money}:{data:AppData;money:(n:number)=>string}) {
  const rows=data.shops.map(s=>({s,b:shopBalance(data,s.id)})).filter(x=>x.b>0).sort((a,b)=>b.b-a.b);
  return <div className="panel table-panel"><div className="panel-head"><div><h2>Outstanding payments</h2><p className="muted">{rows.length} shop(s) currently have a balance.</p></div><strong className="big-number">{money(rows.reduce((a,x)=>a+x.b,0))}</strong></div>{rows.length===0?<Empty text="All shops are up to date. No outstanding balance."/>:<table><thead><tr><th>Shop</th><th>Phone</th><th>Last supply</th><th>Outstanding</th></tr></thead><tbody>{rows.map(x=><tr key={x.s.id}><td><b>{x.s.name}</b><small>{x.s.owner}</small></td><td>{x.s.phone||"—"}</td><td>{[...data.supplies].filter(s=>s.shopId===x.s.id).sort((a,b)=>b.date.localeCompare(a.date))[0]?.date?dateLabel([...data.supplies].filter(s=>s.shopId===x.s.id).sort((a,b)=>b.date.localeCompare(a.date))[0].date):"—"}</td><td><b className="red">{money(x.b)}</b></td></tr>)}</tbody></table>}</div>
}

function Reports({data,money}:{data:AppData;money:(n:number)=>string}) {
  const [from,setFrom]=useState(new Date(new Date().setDate(new Date().getDate()-29)).toISOString().slice(0,10)),[to,setTo]=useState(today());
  const supplies=data.supplies.filter(s=>s.date>=from&&s.date<=to), payments=data.payments.filter(p=>p.date>=from&&p.date<=to);
  const supplyTotal=supplies.reduce((a,s)=>a+s.total,0),paymentTotal=payments.reduce((a,p)=>a+p.amount,0);
  const productTotals=new Map<string,number>(); supplies.forEach(s=>s.items.forEach(i=>productTotals.set(i.productName,(productTotals.get(i.productName)||0)+i.total)));
  const exportReport=()=>downloadCsv(`water-report-${from}-to-${to}.csv`,[["Date","Type","Shop","Amount"],...supplies.map(s=>["Supply","Supply",data.shops.find(x=>x.id===s.shopId)?.name||"",s.total]),...payments.map(p=>["Payment","Payment",data.shops.find(x=>x.id===p.shopId)?.name||"",p.amount])]);
  return <><div className="panel filters"><label>From<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><button className="secondary" onClick={exportReport}><Download size={17}/> Export CSV</button></div><div className="stats"><Stat icon={Droplets} label="Supply" value={money(supplyTotal)}/><Stat icon={Banknote} label="Collection" value={money(paymentTotal)}/><Stat icon={Wallet} label="Net Pending" value={money(supplyTotal-paymentTotal)}/><Stat icon={ClipboardList} label="Transactions" value={String(supplies.length+payments.length)}/></div><div className="two-col"><div className="panel"><h2>Product sales</h2>{[...productTotals.entries()].map(([name,val])=><div className="progress-row" key={name}><div><span>{name}</span><b>{money(val)}</b></div><div className="progress"><i style={{width:`${supplyTotal?Math.min(100,val/supplyTotal*100):0}%`}}/></div></div>)}</div><div className="panel"><h2>Shop-wise supply</h2>{data.shops.map(s=>{const v=supplies.filter(x=>x.shopId===s.id).reduce((a,x)=>a+x.total,0);return v>0?<div className="progress-row" key={s.id}><div><span>{s.name}</span><b>{money(v)}</b></div><div className="progress"><i style={{width:`${supplyTotal?Math.min(100,v/supplyTotal*100):0}%`}}/></div></div>:null})}</div></div></>
}

function Products({data,setData,money}:{data:AppData;setData:React.Dispatch<React.SetStateAction<AppData>>;money:(n:number)=>string}) {
  const [form,setForm]=useState<Product|null>(null),[newName,setNewName]=useState(""),[newPrice,setNewPrice]=useState("");
  const save=()=>{if(!newName.trim()||Number(newPrice)<0)return;const p:Product={id:crypto.randomUUID(),name:newName.trim(),price:Number(newPrice),active:true};setData(d=>({...d,products:[...d.products,p]}));setNewName("");setNewPrice("")};
  return <div className="two-col"><div className="panel form-panel"><h2>Add product</h2><label>Product name<input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Soda"/></label><label>Default price<input type="number" min="0" value={newPrice} onChange={e=>setNewPrice(e.target.value)}/></label><button className="primary" onClick={save}><Plus size={18}/> Add Product</button></div><div className="panel table-panel"><h2>Products</h2><table><thead><tr><th>Product</th><th>Price</th><th>Status</th><th></th></tr></thead><tbody>{data.products.map(p=><tr key={p.id}><td><b>{p.name}</b></td><td>{money(p.price)}</td><td><span className={`status ${p.active?"paid":"pending"}`}>{p.active?"ACTIVE":"INACTIVE"}</span></td><td><button className="icon-btn" onClick={()=>setForm(p)}><Pencil size={16}/></button></td></tr>)}</tbody></table></div>{form&&<ProductModal product={form} onClose={()=>setForm(null)} onSave={p=>{setData(d=>({...d,products:d.products.map(x=>x.id===p.id?p:x)}));setForm(null)}}/>}</div>
}

function ProductModal({product,onClose,onSave}:{product:Product;onClose:()=>void;onSave:(p:Product)=>void}){const [p,setP]=useState(product);return <Modal title="Edit Product" onClose={onClose}><label>Product name<input value={p.name} onChange={e=>setP({...p,name:e.target.value})}/></label><label>Price<input type="number" min="0" value={p.price} onChange={e=>setP({...p,price:Number(e.target.value)})}/></label><label className="check"><input type="checkbox" checked={p.active} onChange={e=>setP({...p,active:e.target.checked})}/> Active product</label><div className="modal-actions"><button className="secondary" onClick={onClose}>Cancel</button><button className="primary" onClick={()=>onSave(p)}>Save</button></div></Modal>}

function SettingsPage({data,setData,money}:{data:AppData;setData:React.Dispatch<React.SetStateAction<AppData>>;money:(n:number)=>string}) {
  const [s,setS]=useState(data.settings); const save=()=>{setData(d=>({...d,settings:s}));alert("Settings saved.")};
  const importBackup=(e:React.ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const parsed=JSON.parse(String(r.result));if(parsed.shops&&parsed.products&&parsed.supplies&&parsed.payments&&parsed.settings){setData(parsed);alert("Backup restored.");}else alert("Invalid backup file.");}catch{alert("Could not read backup file.")}};r.readAsText(file)};
  const backup=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`water-business-backup-${today()}.json`;a.click();URL.revokeObjectURL(url)};
  return <div className="two-col"><div className="panel form-panel"><h2>Business information</h2><label>Business Name<input value={s.businessName} onChange={e=>setS({...s,businessName:e.target.value})}/></label><label>Owner Name<input value={s.ownerName} onChange={e=>setS({...s,ownerName:e.target.value})}/></label><label>Phone<input value={s.phone} onChange={e=>setS({...s,phone:e.target.value})}/></label><label>Address<textarea value={s.address} onChange={e=>setS({...s,address:e.target.value})}/></label><label>Currency<input value={s.currency} onChange={e=>setS({...s,currency:e.target.value})}/></label><label className="check"><input type="checkbox" checked={s.darkMode} onChange={e=>setS({...s,darkMode:e.target.checked})}/> Dark mode</label><button className="primary" onClick={save}>Save Settings</button></div><div className="panel form-panel"><h2>Backup & export</h2><p className="muted">Keep a backup so your business records can be restored on another browser/device.</p><button className="secondary full" onClick={backup}><Download size={18}/> Download JSON Backup</button><button className="secondary full" onClick={()=>exportAll(data)}><Download size={18}/> Export Transactions CSV</button><label className="file-btn">Restore JSON Backup<input type="file" accept=".json,application/json" onChange={importBackup}/></label><div className="tip"><b>Storage note</b><p>This version stores data in this browser. Use the JSON backup regularly. For multi-device access, connect the app to a hosted database such as Supabase later.</p></div></div></div>
}
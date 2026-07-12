'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminLayout } from './AdminLayout';
import api from '@/lib/api';

function CategoryPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [cats, setCats] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get('/api/categories/all-slugs').then(r => setCats(r.data.data || [])).catch(() => {});
  }, []);

  const byId: Record<string, any> = {};
  cats.forEach((c: any) => { byId[String(c.id)] = c; });
  const childrenOf: Record<string, any[]> = {};
  cats.forEach((c: any) => {
    const pid = c.parentId ? String(c.parentId) : 'root';
    if (!childrenOf[pid]) childrenOf[pid] = [];
    childrenOf[pid].push(c);
  });
  Object.values(childrenOf).forEach((arr: any) => arr.sort((a: any, b: any) => (a.nameKa || a.nameEn || '').localeCompare(b.nameKa || b.nameEn || '')));

  const buildPath = (id: string): string => {
    const path: string[] = [];
    let cur = byId[String(id)];
    let guard = 0;
    while (cur && guard < 10) {
      path.unshift(cur.nameKa || cur.nameEn);
      cur = cur.parentId ? byId[String(cur.parentId)] : null;
      guard++;
    }
    return path.join(' / ');
  };
  const displayVal = value ? buildPath(value) : '';

  const q = search.trim().toLowerCase();
  const searchResults = q
    ? cats.filter((c: any) => (c.nameKa || '').toLowerCase().includes(q) || (c.nameEn || '').toLowerCase().includes(q)).slice(0, 50)
    : null;

  const renderNode = (c: any, depth: number): any => {
    const kids = childrenOf[String(c.id)] || [];
    const isExpanded = expandedIds.has(String(c.id));
    const isSelected = value === String(c.id);
    return (
      <div key={c.id}>
        <div className={`flex items-center hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`} style={{ paddingLeft: 12 + depth * 16 }}>
          {kids.length > 0 ? (
            <button type="button"
              onClick={() => setExpandedIds(prev => { const n = new Set(prev); const k = String(c.id); n.has(k) ? n.delete(k) : n.add(k); return n; })}
              className="w-6 h-6 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
              {isExpanded ? '−' : '+'}
            </button>
          ) : <span className="w-6 h-6 flex-shrink-0" />}
          <button type="button"
            onClick={() => { onChange(String(c.id)); setOpen(false); setSearch(''); }}
            className={`flex-1 text-left py-2 pr-3 text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
            {c.nameKa || c.nameEn}
          </button>
        </div>
        {isExpanded && kids.map((k: any) => renderNode(k, depth + 1))}
      </div>
    );
  };

  return (
    <div className="relative">
      <label className="text-xs text-gray-500 mb-1 block">კატეგორია (Autodoc)</label>
      <button type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-left flex justify-between items-center bg-white hover:border-blue-400 transition">
        <span className={displayVal ? 'text-gray-800' : 'text-gray-400'}>{displayVal || '-- აირჩიე კატეგორია --'}</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-80 overflow-y-auto">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ძებნა..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          {searchResults ? (
            searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">ვერაფერი მოიძებნა</div>
            ) : searchResults.map((c: any) => (
              <button key={c.id} type="button"
                onClick={() => { onChange(String(c.id)); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition border-b border-gray-50 ${value === String(c.id) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}>
                <div>{c.nameKa || c.nameEn}</div>
                <div className="text-xs text-gray-400">{buildPath(String(c.parentId || ''))}</div>
              </button>
            ))
          ) : (
            (childrenOf['root'] || []).map((c: any) => renderNode(c, 0))
          )}
        </div>
      )}
    </div>
  );
}

export function AdminProducts() {
  const sp = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLow, setFilterLow] = useState(sp?.get('filter')==='lowStock');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [editing, setEditing] = useState<any>(null);
  const [stockVal, setStockVal] = useState('');
  const [editFull, setEditFull] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editImgUploading, setEditImgUploading] = useState(false);
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [deletingBatch, setDeletingBatch] = useState<number|null>(null);

  const loadImportHistory = async () => {
    try {
      const { data } = await api.get('/api/admin/import-batches');
      setImportHistory(data);
      setShowHistory(true);
    } catch(e:any) { alert('შეცდომა: ' + e.message); }
  };

  const deleteBatch = async (id: number, filename: string) => {
    if (id === -1) { alert('ეს batch-ის გარეშე დამატებული პროდუქტებია — წაშლა შეუძლებელია'); return; }
    if (!confirm(`წაიშლება ექსელი: "${filename}" და ყველა მისი პროდუქტი. დარწმუნებული ხარ?`)) return;
    setDeletingBatch(id);
    try {
      await api.delete(`/api/admin/import-batches/${id}`);
      setImportHistory(prev => prev.filter(b => b.id !== id));
      fetch();
      alert('წაიშალა!');
    } catch(e:any) { alert('შეცდომა: ' + e.message); }
    finally { setDeletingBatch(null); }
  };
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const [adding, setAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({nameKa:'',nameEn:'',sku:'',brand:'',articleNumber:'',price:'',stock:'',description:'',autodocCategoryId:''});
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [newProductImages, setNewProductImages] = useState<string[]>([]);

  const uploadImage = async (file: File): Promise<string|null> => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const r = await api.post('/api/admin/upload-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return r.data.url || null;
    } catch { return null; }
  };

  const handleImageFiles = async (files: FileList) => {
    if (newProductImages.length >= 5) return;
    setUploadingImg(true);
    const remaining = 5 - newProductImages.length;
    const toUpload = Array.from(files).slice(0, remaining);
    const urls: string[] = [];
    for (const file of toUpload) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setNewProductImages(prev => [...prev, ...urls]);
    setUploadingImg(false);
  };

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.q = search;
      if (filterLow) params.inStock = 'false';
      const r = await api.get('/api/products', { params });
      const prods = r.data.data || r.data.products || [];
      setProducts(prods);
      setTotalPages(r.data.pagination?.pages || r.data.totalPages || 1);
      setTotalProducts(r.data.pagination?.total || r.data.total || 0);
      setTotalValue(prods.reduce((s: number, p: any) => s + parseFloat(p.price || 0), 0));
    } catch(e){ console.error(e); } finally { setLoading(false); }
  }, [page, search, filterLow]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStock = async () => {
    if (!editing) return;
    try {
      await api.patch(`/api/admin/products/${editing.id}/stock`, { stock: parseInt(stockVal) });
      setEditing(null); fetch();
    } catch { alert('შეცდომა'); }
  };

  const openEditFull = (p: any) => {
    setEditFull(p);
    setEditForm({
      sku: p.sku||'',
      dataLocked: p.dataLocked ?? true,
      nameKa: p.nameKa||'', nameEn: p.nameEn||'', nameRu: p.nameRu||'',
      brand: p.brand||'', articleNumber: p.articleNumber||'',
      price: p.price||'', stock: p.stock||0,
      description: p.description||'', isActive: p.isActive!==false,
      images: p.images||[],
      autodocCategoryId: p.autodocCategoryId ? String(p.autodocCategoryId) : '',
    });
  };

  const saveEditFull = async () => {
    if (!editFull) return;
    setEditSaving(true);
    try {
      await api.put(`/api/products/${editFull.id}`, {
        sku: editForm.sku,
        dataLocked: editForm.dataLocked,
        nameKa: editForm.nameKa,
        nameEn: editForm.nameEn,
        nameRu: editForm.nameRu,
        brand: editForm.brand,
        articleNumber: editForm.articleNumber,
        price: parseFloat(editForm.price)||0,
        stock: parseInt(editForm.stock)||0,
        description: editForm.description,
        isActive: editForm.isActive,
        images: editForm.images,
        autodocCategoryId: editForm.autodocCategoryId || null,
      });
      setEditFull(null);
      fetch();
    } catch(e:any){ alert('შეცდომა: '+e.message); }
    setEditSaving(false);
  };

  const handleEditImage = async (files: FileList) => {
    if ((editForm.images||[]).length >= 5) return;
    setEditImgUploading(true);
    const toUpload = Array.from(files).slice(0, 5 - (editForm.images||[]).length);
    const urls: string[] = [];
    for (const file of toUpload) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setEditForm((f:any) => ({...f, images: [...(f.images||[]), ...urls]}));
    setEditImgUploading(false);
  };

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`წაიშლება: "${name}" — დარწმუნებული ხარ?`)) return;
    try {
      await api.delete(`/api/products/${id}`);
      setEditFull(null);
      fetch();
    } catch(e:any){ alert('შეცდომა: '+e.message); }
  };

  const [finaImporting, setFinaImporting] = useState(false);
  const [finaResult, setFinaResult] = useState<any>(null);
  const [finaModal, setFinaModal] = useState(false);
  const [bulkImgModal, setBulkImgModal] = useState(false);
  const [bulkImgFiles, setBulkImgFiles] = useState<File[]>([]);
  const [bulkImgUploading, setBulkImgUploading] = useState(false);
  const [bulkImgResult, setBulkImgResult] = useState<any>(null);
  const submitBulkImages = async () => {
    if (!bulkImgFiles.length) return;
    setBulkImgUploading(true);
    setBulkImgResult(null);
    try {
      const formData = new FormData();
      bulkImgFiles.forEach(f => formData.append('images', f));
      const { data } = await api.post('/api/admin/bulk-image-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBulkImgResult(data);
      fetch();
    } catch (e: any) {
      setBulkImgResult({ error: e.response?.data?.error || e.message });
    }
    setBulkImgUploading(false);
  };
  const [finaStatus, setFinaStatus] = useState<any>(null);
  const finaPollRef = { current: null as any };

  const pollFinaStatus = () => {
    const poll = async () => {
      try {
        const { data } = await api.get('/api/admin/fina-import-status');
        setFinaStatus(data);
        if (data.status === 'processing') {
          finaPollRef.current = setTimeout(poll, 5000);
        } else {
          setFinaImporting(false);
          if (data.result) setFinaResult(data.result);
        }
      } catch { setFinaImporting(false); }
    };
    poll();
  };
  const [finaFiles, setFinaFiles] = useState<{tamazuka: File|null, kakha: File|null}>({tamazuka:null, kakha:null});

  const finaImport = async () => {
    setFinaImporting(true); setFinaResult(null);
    try {
      const formData = new FormData();
      if (finaFiles.tamazuka) formData.append('tamazuka', finaFiles.tamazuka);
      if (finaFiles.kakha) formData.append('kakha', finaFiles.kakha);
      const r = await api.post('/api/admin/fina-import-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (r.data.status === 'already_processing') {
        alert(r.data.message);
        setFinaImporting(false);
        pollFinaStatus();
        return;
      }
      setFinaModal(false);
      pollFinaStatus();
      return;
    } catch(e:any) { alert('შეცდომა: ' + e.message); setFinaImporting(false); }
  };

  const syncFina = async () => {
    setSyncing(true); setSyncMsg('');
    try {
      const r = await api.post('/api/fina/sync');
      setSyncMsg('sync: ' + r.data.synced + ' prod | ' + r.data.updated + ' updated');
      fetch();
    } catch { setSyncMsg('sync error'); } finally { setSyncing(false); }
  };

  const addProduct = async () => {
    if (!newProduct.nameKa || !newProduct.sku) return alert('სახელი და SKU სავალდებულოა');
    setSaving(true);
    try {
      await api.post('/api/products', {
        ...newProduct,
        price: parseFloat(newProduct.price)||0,
        stock: parseInt(newProduct.stock)||0,
        images: newProductImages,
      });
      setAdding(false);
      setNewProduct({nameKa:'',nameEn:'',sku:'',brand:'',articleNumber:'',price:'',stock:'',description:'',autodocCategoryId:''});
      setNewProductImages([]);
      fetch();
    } catch(e:any){ alert('error: '+e.message); } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-800">პროდუქტები</h1>
        {totalProducts > 0 && (
          <div className="flex gap-4 mt-2 flex-wrap">
            {[
              ['📦 სულ პროდუქტი', totalProducts.toLocaleString()],
              ['✅ მარაგშია', products.filter((p:any) => p.stock > 0).length + ' / ' + products.length],
              ['📄 გვერდი', `${page} / ${totalPages}`],
            ].map(([label, val]) => (
              <div key={label as string} className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
                <span className="text-xs text-blue-600 font-medium">{label}: </span>
                <span className="text-sm font-bold text-blue-800">{val}</span>
              </div>
            ))}
          </div>
        )}
          <div className="flex gap-2 flex-wrap">
            <button onClick={()=>setFinaModal(true)} className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800">
              {finaStatus?.status === 'processing'
                ? `⏳ მუშავდება... ${Math.floor((finaStatus.elapsedSec||0)/60)}წთ ${(finaStatus.elapsedSec||0)%60}წმ`
                : '📂 FINA Import'}
            </button>
            <button onClick={syncFina} disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-60">
              {syncing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : null}
              FINA sync
            </button>
            <button onClick={()=>{setBulkImgModal(true); setBulkImgResult(null); setBulkImgFiles([]);}}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
              📷 სურათების ატვირთვა
            </button>
            <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-green-700 transition"
              onClick={()=>{
                const markup = prompt('ფასნამატი % (0 = ზუსტი ფასი, მაგ: 50 = +50%):', '0');
                if (markup === null) return;
                const inp = document.getElementById('excel-import-input') as HTMLInputElement;
                if (inp) { (inp as any)._markup = markup; inp.click(); }
              }}>
              Excel Import
            </button>
            <input id="excel-import-input" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={async(e)=>{
              const file = e.target.files?.[0]; if(!file) return;
              const markup = parseFloat((e.target as any)._markup || '0') || 0;
              const fd = new FormData();
              fd.append('file', file);
              fd.append('markup', String(markup));
              try {
                const r = await api.post('/api/admin/products/import', fd, {headers:{'Content-Type':'multipart/form-data'}});
                const rep = r.data.report;
                const msg = rep
                  ? `✅ იმპორტი დასრულდა!\n\n` +
                    `📦 სულ: ${rep.total}\n` +
                    `🤖 ავტო კატეგ: ${rep.autoMatched} (${rep.accuracy})\n` +
                    `⚠️ Review Queue: ${rep.review}\n` +
                    `❌ უცნობი: ${rep.unknown}\n\n` +
                    `➕ დამატებული: ${r.data.added}\n` +
                    `🔄 განახლებული: ${r.data.updated}` +
                    (markup > 0 ? `\n💰 ფასნამატი: +${markup}%` : '') +
                    (rep.review > 0 ? `\n\n⚠️ ${rep.review} პროდუქტი Review Queue-ში გადავიდა` : '')
                  : 'added: ' + r.data.added + ', updated: ' + r.data.updated;
                alert(msg);
                if (rep?.review > 0) window.location.href = '/admin/review-queue';
                fetch();
              } catch(e:any){ alert('error: '+e.message); }
              e.target.value = '';
            }} />
            <button onClick={loadImportHistory}
              className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-600 transition">
              📋 Import ისტორია
            </button>
            {showHistory && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={()=>setShowHistory(false)}>
                <div className="bg-white rounded-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">📋 Excel Import ისტორია</h2>
                    <button onClick={()=>setShowHistory(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                  </div>
                  {importHistory.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">Import ისტორია ცარიელია</p>
                  ) : (
                    <div className="space-y-3">
                      {importHistory.map((b:any) => (
                        <div key={b.id} className="border rounded-lg p-4 flex justify-between items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{b.filename}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(b.importedAt || b.imported_at).toLocaleString('ka-GE')} · ✅ {b.productCount || b.active_products || 0} აიტვირთა
                              {b.rejectedCount > 0 && <span className="text-red-500"> · ❌ {b.rejectedCount} ვერ დაემთხვა</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            {b.rejectedReportUrl && (
                              <a href={b.rejectedReportUrl} download
                                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap">
                                📥 ვერ დაემთხვა ({b.rejectedCount})
                              </a>
                            )}
                            <button
                              onClick={() => deleteBatch(b.id, b.filename)}
                              disabled={deletingBatch === b.id}
                              className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50">
                              {deletingBatch === b.id ? '...' : '🗑️'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <a href="/api/admin/categories-export" download="kibilov_import.xlsx"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition">
              📥 ნიმუში Excel
            </a>
            <a href="/api/admin/categories-export" download="categories.xlsx"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition">
              📋 კატეგორიები
            </a>
            <button onClick={()=>setAdding(true)}
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 transition">
              + პროდუქტის დამატება
            </button>
          </div>
        </div>
        {syncMsg && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">{syncMsg}</div>}

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="სახელი, SKU, ბრენდი..."
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={filterLow} onChange={e=>{ setFilterLow(e.target.checked); setPage(1); }} className="rounded"/>
            ბოლოვდება
          </label>
          <button onClick={fetch} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">განახლება</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['SKU','სახელი','ბრენდი','OEM','ფასი','მარაგი','სტატუსი',''].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={8} className="py-12 text-center"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-gray-400">პროდუქტები ვერ მოიძებნა</td></tr>
                ) : products.map((p:any) => (
                  <tr key={p.id} className={`hover:bg-gray-50 ${p.stock <= 3 ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku} {p.dataLocked && <span title="დაცულია ავტომატური re-import-ისგან">🔒</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && <img src={p.images[0]} className="w-10 h-10 object-cover rounded-lg" alt=""/>}
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{p.nameKa||p.nameEn||'—'}</p>
                          <p className="text-xs text-gray-400">{p.autodocCategory?.nameKa||''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.brand||'—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.articleNumber||'—'}</td>
                    <td className="px-4 py-3"><span className="font-semibold">{parseFloat(p.price).toFixed(2)}₾</span></td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.stock === 0 ? 'text-red-600' : p.stock <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.stock === 0 ? <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">გათავდა</span>
                      : p.stock <= 3 ? <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">ბოლოვდება</span>
                      : <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">მარაგშია</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={()=>{setEditing(p);setStockVal(String(p.stock));}} className="text-blue-600 hover:underline text-xs">მარაგი</button>
                        <button onClick={()=>openEditFull(p)} className="text-green-600 hover:underline text-xs">✏️ რედ.</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 rounded border text-sm disabled:opacity-50">←</button>
              <span className="text-sm text-gray-600">{page} / {totalPages}</span>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1 rounded border text-sm disabled:opacity-50">→</button>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setEditing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">მარაგის განახლება</h3>
            <p className="text-sm text-gray-500 mb-4">{editing.nameKa||editing.nameEn}</p>
            <div className="flex gap-2 items-center mb-4">
              <button onClick={()=>setStockVal(v=>String(Math.max(0,parseInt(v||'0')-1)))} className="w-10 h-10 rounded-lg border text-xl font-bold hover:bg-gray-100">-</button>
              <input type="number" value={stockVal} onChange={e=>setStockVal(e.target.value)} min="0"
                className="flex-1 border rounded-lg px-3 py-2 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <button onClick={()=>setStockVal(v=>String(parseInt(v||'0')+1))} className="w-10 h-10 rounded-lg border text-xl font-bold hover:bg-gray-100">+</button>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setEditing(null)} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">გაუქმება</button>
              <button onClick={updateStock} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700">შენახვა</button>
            </div>
          </div>
        </div>
      )}

      {editFull && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setEditFull(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">პროდუქტის რედაქტირება</h3>
              <button onClick={()=>setEditFull(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">სახელი (KA) *</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.nameKa} onChange={e=>setEditForm((f:any)=>({...f,nameKa:e.target.value}))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">სახელი (EN)</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.nameEn} onChange={e=>setEditForm((f:any)=>({...f,nameEn:e.target.value}))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">SKU (თქვენი კოდი)</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    value={editForm.sku} onChange={e=>setEditForm((f:any)=>({...f,sku:e.target.value}))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">OEM კოდი</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.articleNumber} onChange={e=>setEditForm((f:any)=>({...f,articleNumber:e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">ბრენდი</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editForm.brand} onChange={e=>setEditForm((f:any)=>({...f,brand:e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ფასი (₾)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.price} onChange={e=>setEditForm((f:any)=>({...f,price:e.target.value}))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">მარაგი</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editForm.stock} onChange={e=>setEditForm((f:any)=>({...f,stock:e.target.value}))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">აღწერა</label>
                <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={editForm.description} onChange={e=>setEditForm((f:any)=>({...f,description:e.target.value}))} />
              </div>
              <CategoryPicker value={editForm.autodocCategoryId||''} onChange={v=>setEditForm((f:any)=>({...f,autodocCategoryId:v}))}/>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">სურათები ({(editForm.images||[]).length}/5)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(editForm.images||[]).map((img:string, i:number) => (
                    <div key={i} className="relative">
                      <img src={img} className="w-16 h-16 object-cover rounded-lg border" alt=""/>
                      <button onClick={()=>setEditForm((f:any)=>({...f,images:f.images.filter((_:any,j:number)=>j!==i)}))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                    </div>
                  ))}
                  {(editForm.images||[]).length < 5 && (
                    <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 text-gray-400 text-xs">
                      {editImgUploading ? '...' : '+ სურ.'}
                      <input type="file" accept="image/*" multiple className="hidden" onChange={e=>e.target.files&&handleEditImage(e.target.files)}/>
                    </label>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.isActive} onChange={e=>setEditForm((f:any)=>({...f,isActive:e.target.checked}))}
                  className="w-4 h-4 accent-blue-600"/>
                <span className="text-sm text-gray-700">აქტიური (ჩანს საიტზე)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.dataLocked} onChange={e=>setEditForm((f:any)=>({...f,dataLocked:e.target.checked}))}
                  className="w-4 h-4 accent-amber-600"/>
                <span className="text-sm text-gray-700">🔒 დაცვა ავტომატური re-import-ისგან (ბრენდი/OEM/კატეგორია)</span>
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setEditFull(null)} className="border rounded-lg py-2 px-4 text-sm hover:bg-gray-50">გაუქმება</button>
              <button onClick={()=>deleteProduct(editFull.id, editFull.nameKa||editFull.nameEn)}
                className="border border-red-300 text-red-600 rounded-lg py-2 px-4 text-sm hover:bg-red-50">🗑️ წაშლა</button>
              <button onClick={saveEditFull} disabled={editSaving} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-60">
                {editSaving ? 'ინახება...' : '💾 შენახვა'}
              </button>
            </div>
          </div>
        </div>
      )}

      {finaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setFinaModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">📂 FINA Import</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">თამაზუკა — Excel ფაილი</label>
                <input type="file" accept=".xlsx,.xls" onChange={e=>setFinaFiles(f=>({...f,tamazuka:e.target.files?.[0]||null}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">კახაბერი — Excel ფაილი</label>
                <input type="file" accept=".xlsx,.xls" onChange={e=>setFinaFiles(f=>({...f,kakha:e.target.files?.[0]||null}))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setFinaModal(false)} className="flex-1 border rounded-lg py-2 text-sm">გაუქმება</button>
              <button onClick={finaImport} disabled={finaImporting || (!finaFiles.tamazuka && !finaFiles.kakha)}
                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                {finaImporting ? '⏳ იტვირთება...' : '✅ განახლება'}
              </button>
            </div>
          </div>
        </div>
      )}

      {finaResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setFinaResult(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">📂 FINA Import შედეგი</h3>
            {finaResult.map((r:any, i:number) => (
              <div key={i} className="mb-3 p-3 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-800">{r.name}</p>
                {r.error ? <p className="text-red-500 text-sm">{r.error}</p> : (
                  <p className="text-sm text-gray-600">✅ დამატებული: {r.added} | განახლებული: {r.updated}</p>
                )}
              </div>
            ))}
            <button onClick={()=>setFinaResult(null)} className="btn-primary w-full mt-4">დახურვა</button>
          </div>
        </div>
      )}

      {bulkImgModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>!bulkImgUploading && setBulkImgModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">📷 სურათების ატვირთვა</h3>
            <p className="text-xs text-gray-500 mb-4">აირჩიე ფოლდერი — ყოველი სურათის სახელი უნდა იყოს SKU კოდი (მაგ. 002005.jpg). რამდენიმე სურათი ერთ პროდუქტზე: 002005_2.jpg, 002005_3.jpg.</p>
            {!bulkImgResult ? (
              <>
                <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 transition mb-4">
                  <input type="file" multiple {...({ webkitdirectory: 'true', directory: 'true' } as any)}
                    onChange={e=>setBulkImgFiles(Array.from(e.target.files||[]))}
                    className="hidden" />
                  <span className="text-4xl block mb-2">📁</span>
                  <span className="text-sm text-gray-600">{bulkImgFiles.length ? `${bulkImgFiles.length} ფაილი არჩეულია` : 'დააჭირე ფოლდერის ასარჩევად'}</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={()=>setBulkImgModal(false)} disabled={bulkImgUploading} className="flex-1 border rounded-lg py-2 text-sm disabled:opacity-50">გაუქმება</button>
                  <button onClick={submitBulkImages} disabled={bulkImgUploading || !bulkImgFiles.length}
                    className="flex-1 bg-purple-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-purple-700 disabled:opacity-60">
                    {bulkImgUploading ? '⏳ იტვირთება...' : `✅ ატვირთვა (${bulkImgFiles.length})`}
                  </button>
                </div>
              </>
            ) : bulkImgResult.error ? (
              <>
                <p className="text-red-500 text-sm mb-4">❌ {bulkImgResult.error}</p>
                <button onClick={()=>setBulkImgModal(false)} className="btn-primary w-full">დახურვა</button>
              </>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
                  <p className="text-sm font-medium text-green-800">✅ დაკავშირდა: {bulkImgResult.matched?.length || 0} პროდუქტი</p>
                </div>
                {bulkImgResult.unmatched?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 max-h-40 overflow-y-auto">
                    <p className="text-sm font-medium text-amber-800 mb-1">⚠️ ვერ მოიძებნა SKU ({bulkImgResult.unmatched.length}):</p>
                    {bulkImgResult.unmatched.map((f:string, i:number) => (
                      <p key={i} className="text-xs text-amber-700 font-mono">{f}</p>
                    ))}
                  </div>
                )}
                {bulkImgResult.errors?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 max-h-40 overflow-y-auto">
                    <p className="text-sm font-medium text-red-800 mb-1">❌ შეცდომები ({bulkImgResult.errors.length}):</p>
                    {bulkImgResult.errors.map((e:string, i:number) => (
                      <p key={i} className="text-xs text-red-700">{e}</p>
                    ))}
                  </div>
                )}
                <button onClick={()=>{setBulkImgModal(false); setBulkImgResult(null); setBulkImgFiles([]);}} className="btn-primary w-full mt-2">დახურვა</button>
              </>
            )}
          </div>
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=>setAdding(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">ახალი პროდუქტი</h3>
            <div className="space-y-3">
              <input placeholder="სახელი ქართულად *" value={newProduct.nameKa} onChange={e=>setNewProduct({...newProduct,nameKa:e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <input placeholder="სახელი ინგლისურად" value={newProduct.nameEn} onChange={e=>setNewProduct({...newProduct,nameEn:e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="SKU (თქვენი კოდი) *" value={newProduct.sku} onChange={e=>setNewProduct({...newProduct,sku:e.target.value})}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <input placeholder="ბრენდი" value={newProduct.brand} onChange={e=>setNewProduct({...newProduct,brand:e.target.value})}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <input placeholder="OEM კოდი (ნაწილის ორიგინალური ნომერი)" value={newProduct.articleNumber} onChange={e=>setNewProduct({...newProduct,articleNumber:e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="ფასი (ლარი)" type="number" value={newProduct.price} onChange={e=>setNewProduct({...newProduct,price:e.target.value})}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <input placeholder="მარაგი (ცალი)" type="number" value={newProduct.stock} onChange={e=>setNewProduct({...newProduct,stock:e.target.value})}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <textarea placeholder="აღწერა" value={newProduct.description} onChange={e=>setNewProduct({...newProduct,description:e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"/>
              <CategoryPicker value={newProduct.autodocCategoryId} onChange={v=>setNewProduct({...newProduct,autodocCategoryId:v})}/>
            </div>
            {/* სურათები */}
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                {newProductImages.map((url,i) => (
                  <div key={i} className="relative w-16 h-16">
                    <img src={url} className="w-16 h-16 object-cover rounded-lg border"/>
                    <button onClick={()=>setNewProductImages(prev=>prev.filter((_,j)=>j!==i))}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                  </div>
                ))}
                {newProductImages.length < 5 && (
                  <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 text-xs text-gray-400">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e=>e.target.files && handleImageFiles(e.target.files)}/>
                    {uploadingImg ? '...' : <>📷<span>სურათი</span></>}
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400">{newProductImages.length}/5 სურათი</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={()=>setAdding(false)} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">გაუქმება</button>
              <button onClick={addProduct} disabled={saving} className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm hover:bg-green-700 disabled:opacity-60">
                {saving ? 'ინახება...' : 'დამატება'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

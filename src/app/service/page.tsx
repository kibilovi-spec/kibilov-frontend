export default function ServicePage() {
  const services = [
    { icon: '🚚', title: 'მიწოდება', desc: 'სწრაფი მიწოდება საქართველოს ნებისმიერ კუთხეში. თბილისში — 1 სამუშაო დღე, რეგიონებში — 2-3 სამუშაო დღე.' },
    { icon: '🔍', title: 'ნაწილის მოძიება', desc: 'ვეხმარებით სწორი ნაწილის მოძიებაში მარკის, მოდელის და VIN კოდის მიხედვით.' },
    { icon: '↩️', title: 'დაბრუნება', desc: 'შეძენიდან 14 დღის განმავლობაში შეგიძლიათ დაბრუნება, თუ ნაწილი არ შეესაბამება.' },
    { icon: '🛡️', title: 'გარანტია', desc: 'ყველა პროდუქტზე ვიძლევით ხარისხის გარანტიას. დეფექტური ნაწილი შეიცვლება.' },
    { icon: '📞', title: 'კონსულტაცია', desc: 'პროფესიონალი კონსულტანტები დაგეხმარებიან სწორი არჩევანის გაკეთებაში.' },
    { icon: '💳', title: 'გადახდა', desc: 'მიღებულია ნაღდი ანგარიშსწორება, ბარათით გადახდა და გადარიცხვა.' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', color: '#1a1a2e' }}>სერვისი</h1>
      <div style={{ width: '60px', height: '4px', background: '#e05a2b', marginBottom: '32px', borderRadius: '2px' }} />
      <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#444', marginBottom: '40px' }}>
        ჩვენ გთავაზობთ სრულ სერვისს ავტონაწილების შეძენიდან მიწოდებამდე.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
        {services.map((s) => (
          <div key={s.title} style={{ background: '#f8f9fa', borderRadius: '12px', padding: '28px', borderLeft: '4px solid #e05a2b' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{s.icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1a1a2e' }}>{s.title}</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#666', margin: 0 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

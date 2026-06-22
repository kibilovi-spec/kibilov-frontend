export default function AboutPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', color: '#1a1a2e' }}>ჩვენს შესახებ</h1>
      <div style={{ width: '60px', height: '4px', background: '#e05a2b', marginBottom: '32px', borderRadius: '2px' }} />
      
      <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#444', marginBottom: '24px' }}>
        <strong>Kibilov AutoParts</strong> — საქართველოს ავტონაწილების ბაზარზე სანდო პარტნიორი. ჩვენ ვთავაზობთ მაღალი ხარისხის ავტომობილის სათადარიგო ნაწილებს 35-ზე მეტი მსოფლიო მწარმოებლისგან.
      </p>

      <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#444', marginBottom: '40px' }}>
        დაფუძნებული რუსთავში, ჩვენ ვემსახურებით მთელ საქართველოს — სწრაფი მიწოდებით, კონკურენტული ფასებით და პროფესიონალური კონსულტაციით.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {[
          { icon: '🔧', title: '146+', desc: 'კატეგორია' },
          { icon: '🚗', title: '35+', desc: 'ავტომობილის მარკა' },
          { icon: '📦', title: 'სწრაფი', desc: 'მიწოდება' },
          { icon: '✅', title: 'გარანტია', desc: 'ყველა პროდუქტზე' },
        ].map((item) => (
          <div key={item.title} style={{ background: '#f8f9fa', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.icon}</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a2e' }}>{item.title}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '16px', color: '#1a1a2e' }}>ჩვენი მისია</h2>
      <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#444' }}>
        მომხმარებელს მივაწოდოთ სწორი ნაწილი, სწორ დროს, სწორ ფასად. ჩვენი გუნდი მზადაა დაგეხმაროს ნებისმიერ კითხვაში — დაგვიკავშირდით ნებისმიერ სამუშაო დღეს 09:00-დან 19:00-მდე.
      </p>
    </div>
  );
}

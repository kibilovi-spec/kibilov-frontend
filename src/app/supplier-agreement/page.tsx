export const metadata = { title: 'მომწოდებლის ხელშეკრულება — Kibilov AutoParts' };
export default function Page() {
  return (
    <div className="page-container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-dark mb-6">მომწოდებლის ხელშეკრულება</h1>
          <p className="text-sm text-text2 mb-3">განახლებულია: 01 ივნისი, 2025</p>
          <h2 className="text-lg font-bold text-dark mt-6 mb-2">1. ხელშეკრულების საგანი</h2>
          <p className="text-sm text-text2 mb-3 leading-relaxed">კიბილოვი მომწოდებელს ანიჭებს უფლებას განათავსოს ავტონაწილები გასაყიდად kibilov.ge-ზე.</p>
          <h2 className="text-lg font-bold text-dark mt-6 mb-2">2. კომისია</h2>
          <p className="text-sm text-text2 mb-3 leading-relaxed">სტანდარტული კომისია: 15-20% | პრემიუმ კატეგორია: 21-30% (კონკრეტული განაკვეთი განისაზღვრება ინდივიდუალურად)</p>
          <h2 className="text-lg font-bold text-dark mt-6 mb-2">3. გადახდის პირობები</h2>
          <p className="text-sm text-text2 mb-3 leading-relaxed">გადახდა ყოველ 14 კალენდარულ დღეს. მინიმალური ბარიერი: 50₾.</p>
          <h2 className="text-lg font-bold text-dark mt-6 mb-2">4. პროდუქტის მოთხოვნები</h2>
          <p className="text-sm text-text2 mb-3 leading-relaxed">პროდუქტი უნდა იყოს ავთენტური, სწორი OEM კოდებით, სათანადო შეფუთვით.</p>
          <h2 className="text-lg font-bold text-dark mt-6 mb-2">5. კონტაქტი</h2>
          <p className="text-sm text-text2 mb-3 leading-relaxed">info@kibilov.ge | +995 577 575 052</p>
        </div>
      </div>
    </div>
  );
}

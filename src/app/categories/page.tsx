import { Metadata } from 'next';
import { AutodocCategoryTree } from '@/components/AutodocCategoryTree';

export const metadata: Metadata = {
  title: 'კატეგორიები | kibilov.ge',
  description: 'ავტომობილის სათადარიგო ნაწილების კატეგორიები — სამუხრუჭე სისტემა, ფილტრები, ამორტიზატორები, სუსპენზია, ძრავის ნაწილები და სხვა. TRW, Bosch, NGK, KYB და სხვა ბრენდები საუკეთესო ფასად.',
};

export default function CategoriesPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">სათადარიგო ნაწილების კატეგორიები</h1>
      <AutodocCategoryGrid />
    </main>
  );
}

function AutodocCategoryGrid() {
  return <AutodocCategoryTree className="w-full" />;
}

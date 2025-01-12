import { Products } from '@/components/products';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { BannerProduct } from '@/components/banner-product';

export default async function ProductsPage() {
  return (
    <div className="container mx-auto p-4 min-h-screen max-w-7xl">
      <BannerProduct />
      <h1 className="text-3xl font-bold my-4 text-center">Products</h1>
      <Products />
    </div>
  );
}

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { redirect } from 'next/navigation';

export default async function Home() {
  redirect('/products');
}

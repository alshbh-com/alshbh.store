import { Store, MessageCircle, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-16 px-4 border-t border-border/50">
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold gradient-text">
                alshbh.store
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              منصة alshbh.store تمكّنك من إنشاء متجر إلكتروني احترافي يعمل عبر واتساب
              في دقيقة واحدة. ابدأ البيع الآن بدون أي خبرة تقنية!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'الرئيسية' },
                { href: '/#features', label: 'المميزات' },
                { href: '/#pricing', label: 'الأسعار' },
                { href: '/create-store', label: 'أنشئ متجرك' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/201278006248"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground text-sm hover:text-whatsapp transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  واتساب
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@alshbh.store"
                  className="flex items-center gap-2 text-muted-foreground text-sm hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  support@alshbh.store
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} alshbh.store - جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-muted-foreground text-sm hover:text-primary transition-colors">
              سياسة الخصوصية
            </Link>
            <Link to="/terms" className="text-muted-foreground text-sm hover:text-primary transition-colors">
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

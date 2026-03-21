import { useEffect, type ReactNode } from 'react';
import clsx from 'clsx';
import '../styles/mobile-header.css';

// Ref counting for multiple MobileHeader instances
let mobileHeaderCount = 0;

function setMobileHeaderActive(active: boolean) {
  if (active) {
    mobileHeaderCount++;
    document.body.setAttribute('data-mobile-header', '');
  } else {
    mobileHeaderCount = Math.max(0, mobileHeaderCount - 1);
    if (mobileHeaderCount === 0) {
      document.body.removeAttribute('data-mobile-header');
    }
  }
}

export type MobileHeaderProps = {
  className?: string;
  children?: ReactNode;
};

export function MobileHeader({ className, children }: MobileHeaderProps) {
  useEffect(() => {
    setMobileHeaderActive(true);
    return () => setMobileHeaderActive(false);
  }, []);

  return (
    <div className={clsx('mobile-header', className)}>
      {children}
    </div>
  );
}

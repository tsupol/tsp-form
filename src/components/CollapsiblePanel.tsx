import { useState, type ReactNode, type ComponentProps } from 'react';
import clsx from 'clsx';
import { Chevron } from './Chevron';
import "../styles/form.css";
import '../styles/collapsible-panel.css';

export const CollapsiblePanel = ({
                                  title,
                                  children,
                                  className,
                                  chevronProps,
                                  defaultOpen = true,
                                }: {
  title: string;
  className?: string;
  children: ReactNode;
  chevronProps?: ComponentProps<typeof Chevron>;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={clsx('cpanel', className)}>
      <div
        className="cpanel-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="cpanel-header-title">{title}</div>
        <div className="cpanel-chevron">
          <Chevron direction="right" open={open} className="text-current cursor-pointer" size={20} {...chevronProps}/>
        </div>
      </div>

      <div className={clsx('cpanel-content', open && 'open')}>
        {children}
      </div>
    </div>
  );
};

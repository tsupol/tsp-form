import React, { useState } from 'react';
import clsx from 'clsx';
import { Chevron } from './Chevron';
import '../styles/collapsible-panel.css';

export const ExpandablePanel = ({
                                  title,
                                  children,
                                  className,
                                  chevronProps,
                                  defaultOpen = true,
                                }: {
  title: string;
  className?: string;
  children: React.ReactNode;
  chevronProps?: React.ComponentProps<typeof Chevron>;
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
          <Chevron direction="right" open={open} className="text-current cursor-pointer" size={24} {...chevronProps}/>
        </div>
      </div>

      <div className={clsx('cpanel-content', open && 'open')}>
        {children}
      </div>
    </div>
  );
};

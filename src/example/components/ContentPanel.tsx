import React from 'react';

export const ContentPanel = ({ title, children }: { title: string; children: React.ReactNode}) => {
  return (
    <div className="content-panel">
      <div className="content-panel-header-wrapper">
        <span className="content-panel-header">{title}</span>
      </div>
      {children}
    </div>
  )
}
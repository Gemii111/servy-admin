import React from 'react';

/**
 * دالة لتحويل النص المختلط (عربي + إنجليزي) إلى JSX
 * مع معالجة صحيحة للكلمات الإنجليزية بين الأقواس
 * 
 * @param text - النص المختلط الذي يحتوي على كلمات إنجليزية بين أقواس مثل "(Souq)"
 * @returns JSX element مع معالجة صحيحة للاتجاه
 */
export const renderMixedText = (text: string): React.ReactNode => {
  if (!text) return '';
  
  // البحث عن الكلمات الإنجليزية بين الأقواس
  // Pattern يبحث عن: ( أي حرف إنجليزي أو أرقام أو نقاط أو @ أو / )
  const parts = text.split(/(\([A-Za-z0-9.@/\s]+\))/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('(') && part.endsWith(')')) {
      // كلمة إنجليزية بين أقواس - نستخدم span مع direction: ltr
      return (
        <span
          key={index}
          style={{
            direction: 'ltr',
            unicodeBidi: 'embed',
            display: 'inline',
          }}
        >
          {part}
        </span>
      );
    }
    // نص عربي عادي
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
};

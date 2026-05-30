import React from 'react';

interface ProductDescriptionProps {
  htmlContent: string;
}

/**
 * ProductDescription component
 * Renders rich HTML product descriptions created by the Copywriter.
 *
 * SECURITY NOTE: This component uses dangerouslySetInnerHTML with trusted content
 * from our internal copywriting team. Do not use with user-generated content.
 */
const ProductDescription: React.FC<ProductDescriptionProps> = ({ htmlContent }) => {
  return (
    <div className="product-description prose prose-sm sm:prose lg:prose-lg max-w-none">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <style>{`
        .product-description h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .product-description h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          border-bottom: 2px solid #ec4899;
          padding-bottom: 0.5rem;
        }

        .product-description p {
          color: #666;
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .product-description p.lead {
          font-size: 1.125rem;
          font-weight: 500;
          color: #ec4899;
          margin-bottom: 1.5rem;
        }

        .product-description ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 1.5rem;
        }

        .product-description li {
          padding-left: 1.5rem;
          position: relative;
          margin-bottom: 0.5rem;
          color: #555;
          line-height: 1.6;
        }

        .product-description li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #ec4899;
          font-weight: bold;
        }

        .product-description strong {
          color: #1a1a1a;
          font-weight: 600;
        }

        .product-description hr {
          border-color: #e5e7eb;
          margin: 2rem 0;
        }

        .product-description .cta-ready {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 1rem;
          margin-top: 1.5rem;
          border-radius: 0.375rem;
        }

        @media (max-width: 640px) {
          .product-description h1 {
            font-size: 1.5rem;
          }

          .product-description h2 {
            font-size: 1.25rem;
          }

          .product-description p.lead {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDescription;
import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/utils/testUtils';
import PreviewCard from '../../../components/PreviewCard';

describe('PreviewCard Component - Unit Tests', () => {
  describe('Empty State', () => {
    it('should render placeholder when no image', () => {
      render(
        <PreviewCard
          imageSrc={null}
          loading={false}
          altText="Upload an image to see preview"
        />
      );

      expect(screen.getByText('Upload an image to see preview')).toBeInTheDocument();
    });

    it('should show supported formats message', () => {
      render(
        <PreviewCard
          imageSrc={null}
          loading={false}
          altText="Upload an image"
        />
      );

      expect(screen.getByText(/Supports JPG, PNG, GIF/)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when loading', () => {
      render(
        <PreviewCard
          imageSrc={null}
          loading={true}
          altText="Loading"
        />
      );

      // Check for loading text
      expect(screen.getByText(/Generating your masterpiece/)).toBeInTheDocument();
    });
  });

  describe('Image Display', () => {
    it('should render image when imageSrc is provided', () => {
      const imageUrl = 'https://example.com/image.png';
      
      render(
        <PreviewCard
          imageSrc={imageUrl}
          loading={false}
          altText="NFT Preview"
        />
      );

      const img = screen.getByAltText('NFT Preview');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', imageUrl);
    });

    it('should apply correct CSS classes to image', () => {
      const imageUrl = 'https://example.com/image.png';
      
      render(
        <PreviewCard
          imageSrc={imageUrl}
          loading={false}
          altText="NFT Preview"
        />
      );

      const img = screen.getByAltText('NFT Preview');
      expect(img).toHaveClass('object-cover');
    });
  });
});


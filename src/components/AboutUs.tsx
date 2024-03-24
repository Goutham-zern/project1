import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../core/ui/Dialog'; // Import your custom dialog components

const AboutUsDialog = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  const [aboutContent, setAboutContent] = useState('');

  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        // Fetch data from your API endpoint
        const response = await fetch('https://h47ffeovp0.execute-api.me-south-1.amazonaws.com/stage1/content');
        if (!response.ok) {
          throw new Error('Failed to fetch about content');
        }
        const data = await response.json();
        if (data.data.about_page_html !== null) {
            setAboutContent(data.data.about_page_html);
            const imageUrl = parseImageSource(data.data.about_page_html);
            if (imageUrl !== null) {
                setImageUrl(imageUrl); 
            }
        }

      } catch (error) {
        console.error('Error fetching about content:', error);
      }
    };

    if (open) {
      fetchAboutContent();
    }
  }, [open]);

  // Function to parse the image source from the HTML string
  const parseImageSource = (htmlString: string) => {
    const regex = /<img[^>]+src="?([^"\s]+)"?\s*\/?>/g;
    const match = regex.exec(htmlString);
    return match ? match[1] : null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <div dangerouslySetInnerHTML={{ __html: aboutContent.replace(/<img[^>]+>/g, '') }} />
        {/* Render the image separately if it exists */}
        {imageUrl && <img src={imageUrl} alt="About Us" />}
      </DialogContent>
    </Dialog>
  );
};

export default AboutUsDialog;

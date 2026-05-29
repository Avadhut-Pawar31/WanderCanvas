import toast from 'react-hot-toast';

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export async function shareContent(data: ShareData): Promise<boolean> {
  // Check if Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      toast.success('Shared successfully!');
      return true;
    } catch (error) {
      // User cancelled the share or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        return copyToClipboard(data.url);
      }
      return false;
    }
  } else {
    // Fallback to clipboard
    return copyToClipboard(data.url);
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    toast.error('Failed to copy link');
    return false;
  }
}

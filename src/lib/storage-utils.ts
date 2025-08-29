export async function getMediaUrl(siteId: string, order: number, mediaId: string): Promise<string> {
  try {
    // Example working URL:
    // https://firebasestorage.googleapis.com/v0/b/homesell-photography-562f2.firebasestorage.app/o/sites%2F2430769%2Fmedia%2F006_10CBFA0294DDID.jpg?alt=media
    
    // Remove any existing "ID" suffix
    const cleanMediaId = mediaId.replace(/ID$/, '');
    
    // Format the filename
    const filename = `${order.toString().padStart(3, '0')}_${cleanMediaId}ID.jpg`;
    const path = `sites/${siteId}/media/${filename}`;
    
    // Construct the URL
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/homesell-photography-562f2.firebasestorage.app/o';
    const encodedPath = encodeURIComponent(path);
    const url = `${baseUrl}/${encodedPath}?alt=media`;
    
    console.log('Generated URL:', {
      siteId,
      order,
      mediaId,
      cleanMediaId,
      filename,
      path,
      url
    });
    
    return url;
  } catch (error) {
    console.error(`Error generating URL for media ${mediaId}:`, error);
    throw error;
  }
}
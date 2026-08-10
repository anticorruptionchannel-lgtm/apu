export interface StockMediaItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  category: string;
}

export const FREE_STOCK_PRESETS: StockMediaItem[] = [
  {
    id: 'courtroom_hammer',
    title: 'Courtroom & Legal Justice',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=300&q=80',
    category: 'Legal'
  },
  {
    id: 'case_file_audit',
    title: 'Government Audit Case Files',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=300&q=80',
    category: 'Documents'
  },
  {
    id: 'bribe_money_cash',
    title: 'Cash Irregularities & Currency',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=300&q=80',
    category: 'Financial'
  },
  {
    id: 'pakistan_capitol',
    title: 'Pakistan Parliament & Flag',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=300&q=80',
    category: 'State'
  },
  {
    id: 'police_investigation',
    title: 'Police Tape & Crime Scene',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=300&q=80',
    category: 'Enforcement'
  },
  {
    id: 'government_ministry',
    title: 'Government Ministry Building',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1280&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=300&q=80',
    category: 'Infrastructure'
  }
];

export async function searchFreeStockImages(query: string, type: 'video' | 'image' = 'image'): Promise<StockMediaItem[]> {
  try {
    const encoded = encodeURIComponent(query || 'news investigation');
    const res = await fetch(`/api/stock-search?q=${encoded}&type=${type}`);
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items;
      }
    }
    
    // Fallback if no keys or no results
    if (type === 'image') {
      const items: StockMediaItem[] = [
        {
          id: `search_1_${Date.now()}`,
          title: `${query} - Scene Shot A`,
          type: 'image',
          url: `https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1280&q=80&q=${encoded}`,
          thumbnail: `https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=300&q=80&q=${encoded}`,
          category: 'Stock Fallback'
        },
        {
          id: `search_2_${Date.now()}`,
          title: `${query} - Scene Shot B`,
          type: 'image',
          url: `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1280&q=80&q=${encoded}`,
          thumbnail: `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80&q=${encoded}`,
          category: 'Stock Fallback'
        }
      ];
      return items;
    }
    
    return type === 'video' ? [{
      id: `fallback_video_${Date.now()}`,
      title: `${query} (Fallback Sample Video)`,
      type: 'video',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80',
      category: 'Fallback Video'
    }] : FREE_STOCK_PRESETS;
  } catch (err) {
    return type === 'video' ? [{
      id: `fallback_video_${Date.now()}`,
      title: `Sample Video (No API Key)`,
      type: 'video',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80',
      category: 'Fallback Video'
    }] : FREE_STOCK_PRESETS;
  }
}

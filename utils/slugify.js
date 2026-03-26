import slugify from 'slugify';

export const generateSlug = (name) => {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true
  });
};

export const ensureUniqueSlug = async (name, existingId = null) => {
  let slug = generateSlug(name);
  let isUnique = false;
  let counter = 1;
  
  while (!isUnique) {
    const { data } = await supabase
      .from('hostels')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (!data || (existingId && data.id === existingId)) {
      isUnique = true;
    } else {
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }
  }
  
  return slug;
};
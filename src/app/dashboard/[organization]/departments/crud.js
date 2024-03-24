import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3c3F4c2ZjcmFsYnNid2dvaWNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMDg0NzA0OSwiZXhwIjoyMDI2NDIzMDQ5fQ.knN-RXUJ2QvP3K-4H_nAPhXscRjrqfIQfDw3HzNSSsg"
// Create a Supabase client instance

export async function getAllDepartments() {
  console.log(SUPABASE_URL, SUPABASE_ANON_KEY)

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data: organizations, error: organizationsError } = await supabase
    .from('department')
    .select('*');
  return organizations;
}

async function getDepartment() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*');

    if (membersError) {
      throw membersError;
    }

    // Extract UUIDs of organizations from members
    const organizationUUIDs = members.map((member) => member.organization);

    // Query to fetch organization names
    const { data: organizations, error: organizationsError } = await supabase
      .from('organizations')
      .select('*')
      .in('uuid', organizationUUIDs);

    if (organizationsError) {
      throw organizationsError;
    }

    // Map organization UUIDs to names in members data
    const membersWithOrgNames = members.map((member) => {
      const organization = organizations.find(
        (org) => org.uuid === member.organization,
      );
      return {
        ...member,
        organization: organization ? organization.name : null,
      };
    });
    return membersWithOrgNames || [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function createDepartment(departmentData) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error, status } = await supabase.from('department').insert([departmentData]);
    if (error) {
      throw error;
    }
    return status;
  } catch (error) {
    console.log(error);
    return 500
  }
}

async function updateDepartment(departmentId, updateddepartmentData) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error, status } = await supabase
      .from('department')
      .update(updateddepartmentData)
      .eq('id', departmentId);
    if (error) {
      throw error;
    }
    return status;
  } catch (error) {
    return { error };
  }
}

async function deleteDepartment(departmentId) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error, status } = await supabase
      .from('department')
      .delete()
      .eq('id', departmentId);
    if (error) {
      throw error;
    }
    return status;
  } catch (error) {
    return { error };
  }
}

export { createDepartment, updateDepartment, deleteDepartment };

export async function uploadImageToSupabase(name, file) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const imageName = name.replace(/\s/g, '') + '_'

    // Check if an image with the same name exists
    const { data: existingImage, error: existingImageError } = await supabase
      .storage
      .from('department_images')
      .getPublicUrl(`${imageName}.png`);

    if (existingImageError) {
      throw existingImageError;
    }

    console.log('Existing image:', existingImage);

    // If an existing image is found, delete it
    if (existingImage) {
      console.log('Deleting existing image...');
      const { error: deleteError } = await supabase
        .storage
        .from('department_images')
        .remove([`${imageName}.png`]);

      if (deleteError) {
        throw deleteError;
      }
    }

    //https://dwsqxsfcralbsbwgoicp.supabase.co/storage/v1/object/public/department_images/Zod2_.png
    //https://dwsqxsfcralbsbwgoicp.supabase.co/storage/v1/object/public/department_images/Zod2_.png

    // Upload the new image
    console.log(file);
    console.log('Uploading new image...');
    const { data: uploadedImage, error: uploadError } = await supabase
      .storage
      .from('department_images')
      .upload(`${imageName}.png`, file);

    if (uploadError) {
      throw uploadError;
    }

    return uploadedImage;
  } catch (error) {
    console.error('Error uploading image:', error);
    return false;
  }
}

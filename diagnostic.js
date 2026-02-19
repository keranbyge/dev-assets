// Run this in browser console on /dashboard to diagnose issues

async function diagnoseSupabase() {
  console.log("=== Supabase Diagnostic ===");
  
  // Check environment variables
  console.log("\n1. Environment Variables:");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING");
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING");
  
  // Check session
  console.log("\n2. Checking Session:");
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("Session Error:", sessionError);
  } else if (session) {
    console.log("✓ Session valid, User ID:", session.user.id);
  } else {
    console.error("✗ No session found");
  }
  
  // Check storage bucket
  console.log("\n3. Checking Storage Bucket:");
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("Buckets Error:", bucketsError);
    } else {
      console.log("Available buckets:", buckets.map(b => b.name));
      const assetsExists = buckets.some(b => b.name === "assets");
      if (assetsExists) {
        console.log("✓ 'assets' bucket exists");
      } else {
        console.error("✗ 'assets' bucket NOT FOUND - Create it in Supabase Dashboard");
      }
    }
  } catch (err) {
    console.error("Storage check failed:", err);
  }
  
  // Check database table
  console.log("\n4. Checking Database Table:");
  try {
    const { data, error } = await supabase.from("assets").select("count").limit(1);
    if (error) {
      console.error("Table Error:", error);
    } else {
      console.log("✓ 'assets' table accessible");
    }
  } catch (err) {
    console.error("Database check failed:", err);
  }
  
  console.log("\n=== Diagnostic Complete ===");
}

// Run diagnostic
diagnoseSupabase();

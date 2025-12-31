import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createUser() {
  const email = "derikfig@gmail.com"
  const password = "1234"

  console.log("[v0] Creating user account...")
  console.log("[v0] Email:", email)

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      console.error("[v0] Error creating user:", error.message)
      throw error
    }

    console.log("[v0] User created successfully!")
    console.log("[v0] User ID:", data.user.id)
    console.log("[v0] Email:", data.user.email)

    return data
  } catch (error) {
    console.error("[v0] Failed to create user:", error)
    throw error
  }
}

createUser()

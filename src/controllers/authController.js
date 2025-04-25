const { supabase } = require("../config/supabaseClient");

exports.register = async (req, res) => {
  const { email, password, username } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  const userId = data?.user?.id;
  if (!userId) {
    return res.status(500).json({ error: "Missing user ID after signup" });
  }

  await supabase.from('profiles').insert({
    id: data.user.id,
    email,
    username: email.split('@')[0],
  });

  if (profileError) {
    console.error("Profile insert error:", profileError);
    return res.status(500).json({ error: "Database error saving new user", details: profileError });
  }

  res.status(201).json({ message: "User registered", user: data.user });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ token: data.session.access_token, user: data.user });
};

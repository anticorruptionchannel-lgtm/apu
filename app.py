import streamlit as st

# Example of how to use secrets in your Streamlit app
# NOTE: Do NOT commit your real secrets to the repository.

def get_secret(key: str, default=None):
    """
    Safely get a secret value
    
    Usage in your app:
        db_url = get_secret("database_url")
        api_key = get_secret("api_key")
    """
    try:
        return st.secrets[key]
    except KeyError:
        if default is None:
            st.error(f"Secret '{key}' not found in Streamlit secrets!")
        return default

# Example usage in your app
def main():
    st.set_page_config(page_title="APU", layout="wide")
    
    st.title("🔒 APU - Anti-Corruption Platform")
    
    # Access your secrets safely. Provide conservative local defaults for dev/testing only.
    database_url = get_secret("database_url", "sqlite:///apu.db")
    api_key = get_secret("api_key", "demo-key-123456")
    
    # Informational messages: prefer explicit secrets in production
    if database_url:
        if database_url == "sqlite:///apu.db":
            st.info("Using local default database_url (sqlite) — replace with a real database_url in Streamlit Secrets for production.")
        else:
            st.success("✅ Database connection configured")
    else:
        st.warning("⚠️ Database not configured")
    
    if api_key:
        if api_key == "demo-key-123456":
            st.info("Using local default api_key (demo) — add your real api_key to Streamlit Secrets.")
        else:
            st.success("✅ API key configured")
    else:
        st.warning("⚠️ API key not configured")

    st.markdown("---")
    st.markdown("Need help? See SECRETS_GUIDE.md in the repository for instructions on what secrets to add and how to configure Streamlit Secrets.")
    
    # Your app content here
    st.write("Welcome to APU!")

if __name__ == "__main__":
    main()

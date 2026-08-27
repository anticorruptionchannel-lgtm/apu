import streamlit as st

# Example of how to use secrets in your Streamlit app

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
    
    # Access your secrets safely
    database_url = get_secret("database_url")
    api_key = get_secret("api_key")
    
    if database_url:
        st.success("✅ Database connection configured")
    else:
        st.warning("⚠️ Database not configured")
    
    if api_key:
        st.success("✅ API key configured")
    else:
        st.warning("⚠️ API key not configured")
    
    # Your app content here
    st.write("Welcome to APU!")

if __name__ == "__main__":
    main()

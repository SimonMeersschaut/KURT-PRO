import os
import subprocess


# Inject auth into remote URL
token = os.environ['PERSONAL_TOKEN']
remote_url = f"https://x-access-token:{token}@github.com/{os.environ['GITHUB_REPOSITORY']}.git"
subprocess.run(["git", "remote", "set-url", "origin", remote_url], check=True)

# Push commit and tag using personal token
subprocess.run(["git", "push", "origin", "HEAD"], check=True)
subprocess.run(["git", "push", "origin", "--tags"], check=True)


VERSION_FILE = "VERSION"

# Read current version
with open(VERSION_FILE) as f:
    version = f.read().strip()

# Split the version string and increment the patch number
major, minor, patch = version.split('.')
patch = str(int(patch) + 1)
new_version = f"{major}.{minor}.{patch}"

# Write the new version back to the VERSION file
with open(VERSION_FILE, "w") as f:
    f.write(new_version)

print(f"Bumped version: {version} -> {new_version}")

# Configure git (you may want to adjust the email/name to your liking)
subprocess.run(["git", "config", "--global", "user.email", "ci@example.com"], check=True)
subprocess.run(["git", "config", "--global", "user.name", "GitHub Action"], check=True)

# Commit the version bump and add a tag. The "[skip ci]" ensures that this commit does not trigger another CI run.
subprocess.run(["git", "add", VERSION_FILE], check=True)
subprocess.run(["git", "commit", "-m", f"Version bump to {new_version} [skip ci]"], check=True)
subprocess.run(["git", "tag", f"v{new_version}"], check=True)

# Push the commit and tag (using the GitHub token provided by the workflow)
subprocess.run(["git", "push"], check=True)
subprocess.run(["git", "push", "--tags"], check=True)

print("Version bump commit and tag pushed.")

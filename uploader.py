#!/usr/bin/env python3
"""
uploader.py — Upload a rendered MP4 to HuggingFace Dataset repo.
Called from Node.js as a child process:
  python3 uploader.py <local_mp4_path> <remote_filename> <hf_token>
Prints JSON result to stdout.
"""
import sys, json, os
from huggingface_hub import HfApi

def main():
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Usage: uploader.py <path> <filename> <token>"}))
        sys.exit(1)

    local_path = sys.argv[1]
    remote_filename = sys.argv[2]
    hf_token = sys.argv[3]

    REPO_ID = os.environ.get("HF_RENDERS_REPO", "AIgoose/video-renders")
    REPO_TYPE = "dataset"

    try:
        api = HfApi(token=hf_token)

        # Ensure the dataset repo exists (create if not)
        try:
            api.repo_info(repo_id=REPO_ID, repo_type=REPO_TYPE)
        except Exception:
            api.create_repo(repo_id=REPO_ID, repo_type=REPO_TYPE, private=False, exist_ok=True)

        # Upload the file
        url = api.upload_file(
            path_or_fileobj=local_path,
            path_in_repo=f"renders/{remote_filename}",
            repo_id=REPO_ID,
            repo_type=REPO_TYPE,
            commit_message=f"render: {remote_filename}",
        )

        hf_url = f"https://huggingface.co/datasets/{REPO_ID}/resolve/main/renders/{remote_filename}"
        viewer_url = f"https://huggingface.co/datasets/{REPO_ID}/blob/main/renders/{remote_filename}"

        print(json.dumps({
            "success": True,
            "hf_url": hf_url,
            "viewer_url": viewer_url,
            "repo_id": REPO_ID,
            "filename": remote_filename,
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()

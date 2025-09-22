        let folders = [];
        let mediaList = [];
        let currentIndex = 0;
        let target = '';
        const query = new URLSearchParams(location.search);
        const dir = query.get('dir') || '';

        async function loadFolders() {
            const res = await fetch('/folders');
            folders = await res.json();
            const tree = buildTree(folders);
            renderTree(document.getElementById('folderList'), tree, true);
            renderTree(document.getElementById('targetFolder'), tree, false);
        }

        function buildTree(paths) {
            const root = {};
            for (const path of paths) {
                const parts = path.split('/');
                let node = root;
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (!node[part]) {
                        node[part] = {
                            _full: parts.slice(0, i + 1).join('/'),
                            _children: {}
                        };
                    }
                    node = node[part]._children;
                }
            }
            return root;
        }

        function renderTree(container, tree, isLeft) {
            container.innerHTML = '';

            function createNode(name, data) {
                const wrapper = document.createElement('div');
                const hasChildren = Object.keys(data._children).length > 0;

                const label = document.createElement('div');
                label.className = 'folder';
                label.textContent = name;

                if (hasChildren) {
                    label.classList.add('has-children');
                    label.textContent = '';

                    const arrow = document.createElement('span');
                    arrow.className = 'arrow';
                    arrow.textContent = '▸';
                    arrow.onclick = e => {
                        e.stopPropagation();
                        wrapper.classList.toggle('expanded');
                        arrow.textContent = wrapper.classList.contains('expanded') ? '▾' : '▸';
                    };

                    label.appendChild(arrow);
                    label.appendChild(document.createTextNode(name));
                }

                const fullPath = data._full;

                if (isLeft && fullPath === dir) {
                    label.classList.add('selected');
                    expandAncestors(wrapper);
                    setTimeout(() => label.scrollIntoView({ block: 'center' }), 50);
                }

                label.onclick = e => {
                    e.stopPropagation();
                    if (isLeft) {
                        const url = new URL(location.href);
                        url.searchParams.set('dir', fullPath);
                        location.href = url.toString();
                    } else {
                        target = fullPath;
                        document.querySelectorAll('#targetFolder .folder').forEach(el => el.classList.remove('selected'));
                        label.classList.add('selected');
                        setTimeout(() => label.scrollIntoView({ block: 'center' }), 50);
                    }
                };

                wrapper.appendChild(label);

                if (hasChildren) {
                    const nested = document.createElement('div');
                    nested.className = 'nested';
                    for (const key in data._children) {
                        nested.appendChild(createNode(key, data._children[key]));
                    }
                    wrapper.appendChild(nested);
                }

                return wrapper;
            }

            function expandAncestors(el) {
                while (el && el !== container) {
                    if (el.classList.contains('nested')) {
                        el.parentElement.classList.add('expanded');
                    }
                    el = el.parentElement;
                }
            }

            for (const key in tree) {
                container.appendChild(createNode(key, tree[key]));
            }
        }

        async function loadMedia() {
            const res = await fetch(`/files?dir=${encodeURIComponent(dir)}`);
            mediaList = await res.json();
            currentIndex = 0;
            showCurrent();
        }

        function animateSwipe(direction) {
            const el = document.getElementById('preview');
            el.classList.add(direction);
            setTimeout(() => {
                el.classList.remove(direction);
                showCurrent();
            }, 300);
        }

        function showCurrent() {
            const preview = document.getElementById('preview');
            preview.className = '';
            if (currentIndex >= mediaList.length) {
                preview.innerHTML = '<h2>Done</h2>';
                return;
            }
            const item = mediaList[currentIndex];
            const ext = item.split('.').pop().toLowerCase();

            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) {
                preview.innerHTML = `<a data-fancybox="gallery" href="${item}"><img src="${item}" /></a>`;
                Fancybox.bind('[data-fancybox="gallery"]');
            } else if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
                preview.innerHTML = `<a data-fancybox="gallery" href="${item}"><video src="${item}" autoplay muted loop></video></a>`;
                Fancybox.bind('[data-fancybox="gallery"]');
            } else {
                preview.innerHTML = `<div>${item}</div>`;
            }
        }

        async function accept() {
            if (!target) return alert('Select a target folder first');
            const fromPath = mediaList[currentIndex];
            await fetch('/move', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromPath, targetFolder: target })
            });
            currentIndex++;
            animateSwipe('swipe-right');
        }

        function reject() {
            currentIndex++;
            animateSwipe('swipe-left');
        }

        async function init() {
            await loadFolders();
            if (dir) await loadMedia();
        }

        init();
function showAddFolderDialog(){document.getElementById("addFolderModal").style.display="flex";}function hideAddFolderDialog(){document.getElementById("addFolderModal").style.display="none";document.getElementById("folderName").value="";document.getElementById("folderTarget").value="";document.getElementById("addFolderMsg").innerText="";}async function submitAddFolder(){const name=document.getElementById("folderName").value.trim();const target=document.getElementById("folderTarget").value.trim();if(!name){document.getElementById("addFolderMsg").innerText="Name is required.";return;}const body=target?{name,target}:{name};try{const res=await fetch("/addfolder",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const txt=await res.text();if(res.ok){document.getElementById("addFolderMsg").style.color="#4caf50";document.getElementById("addFolderMsg").innerText="Folder created.";}else{document.getElementById("addFolderMsg").style.color="#f44336";document.getElementById("addFolderMsg").innerText=txt;}}catch(e){document.getElementById("addFolderMsg").style.color="#f44336";document.getElementById("addFolderMsg").innerText="Request failed.";}}

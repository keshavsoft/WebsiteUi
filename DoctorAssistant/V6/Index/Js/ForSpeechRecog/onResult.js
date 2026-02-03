const StartFunc = e => {
    if (activeSession !== session || !activeSection) return;
    const r = e.results[e.results.length - 1];
    if (r.isFinal) addNote(r[0].transcript.trim());
};

/* 📝 NOTES */
function addNote(text) {
    finalNotesList.appendChild(document.createElement("li")).textContent = text;
    const ul = document.getElementById(activeSection);
    if (!ul) return;

    const li = document.createElement("li");
    li.className = "note-item";

    const span = document.createElement("span");
    span.textContent = text;

    const actions = document.createElement("div");
    actions.className = "note-actions";

    const edit = document.createElement("button");
    edit.textContent = "✏️";
    edit.onclick = () => {
        const old = span.textContent;
        span.contentEditable = true;
        span.focus();
        span.onkeydown = e => {
            if (e.key === "Enter") { e.preventDefault(); span.contentEditable = false; }
            if (e.key === "Escape") { span.textContent = old; span.contentEditable = false; }
        };
    };

    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.onclick = () => {
        if (!confirm("Delete this note?")) return;
        lastDeleted = li; lastParent = ul;
        ul.removeChild(li);
        showUndo();
    };

    actions.append(edit, del);
    li.append(span, actions);
    ul.appendChild(li);
};

/* ↩️ UNDO */
function showUndo() {
    undoToast.style.display = "flex";
    clearTimeout(undoTimer);
    undoTimer = setTimeout(() => {
        undoToast.style.display = "none";
        lastDeleted = null; lastParent = null;
    }, 5000);
};

export { StartFunc };

// ===== HTML BUILDER HELPERS =====
class HtmlBuilder {
    static createButton(text, className, onClick, icon = null) {
        const iconHtml = icon ? `<i class="bi ${icon}"></i> ` : '';
        return `<button class="btn btn-sm ${className}" onclick="${onClick}">${iconHtml}${text}</button>`;
    }

    static createActionButtons(itemId, itemType, additionalButtons = []) {
        const deleteButton = this.createButton(
            'Elimina', 
            'btn-danger', 
            `app.delete${itemType}(${itemId})`,
            'bi-trash'
        );
        const editButton = this.createButton(
            'Modifica', 
            'btn-primary', 
            `app.showEdit${itemType}Modal(${itemId})`,
            'bi-pencil'
        );
        
        let buttons = deleteButton + editButton;
        
        // Add additional buttons if provided
        additionalButtons.forEach(button => {
            buttons += this.createButton(
                button.text,
                button.className,
                button.onClick,
                button.icon
            );
        });
        
        return buttons;
    }

    static createStatsBadge(icon, value, title = '') {
        const titleAttr = title ? `title="${title}" data-bs-toggle="tooltip" data-bs-placement="top"` : '';
        return `<span ${titleAttr}>${icon} ${value}</span>`;
    }

    static createEmptyStateMessage(message) {
        return `<div class="col-12 text-center"><p class="text-muted">${message}</p></div>`;
    }

    static createParticipantSelector(players, selectedPlayerId = null, selectedPosition = null, participantCount = 0) {
        const playerOptions = players.map(player => 
            `<option value="${player.id}" ${selectedPlayerId === player.id ? 'selected' : ''}>${player.name}</option>`
        ).join('');
        
        const positionOptions = [
            { value: 'winner', label: '🏆 Vincitore (2 punti)', selected: selectedPosition === 'winner' },
            { value: 'participant', label: '🥈 Piazzamento (1 punto)', selected: selectedPosition === 'participant' },
            { value: 'last', label: '😞 Ultimo posto (0 punti)', selected: selectedPosition === 'last' }
        ].map(opt => 
            `<option value="${opt.value}" ${opt.selected ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        const showDeleteButton = participantCount >= 2 || selectedPlayerId;
        const deleteButton = showDeleteButton ? 
            this.createButton('', 'btn-danger', 'this.parentElement.parentElement.parentElement.remove()', 'bi-trash') : '';

        return `
            <div class="participant-row">
                <div class="row w-100">
                    <div class="col-6">
                        <select class="form-select" required>
                            <option value="">Seleziona giocatore...</option>
                            ${playerOptions}
                        </select>
                    </div>
                    <div class="col-4">
                        <select class="form-select" required>
                            <option value="">Posizione...</option>
                            ${positionOptions}
                        </select>
                    </div>
                    <div class="col-2">
                        ${deleteButton}
                    </div>
                </div>
            </div>
        `;
    }
} 
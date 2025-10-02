import PropTypes from 'prop-types';

const allTags = [
    'Social', 'Therapeutic', 'Educational', 'Wellness', 'Creative', 'Volunteering', 'Peer-Led'
];

const FilterModal = ({ isOpen, onClose, filters, setFilters, activeTab, setHasActiveFilters }) => {
    if (!isOpen) return null;

    const handleTagChange = (tag) => {
        setHasActiveFilters(true)
        const newTags = filters.tags.includes(tag) ? filters.tags.filter(t => t !== tag) : [...filters.tags, tag];
        setFilters({ ...filters, tags: newTags });
    };

    const handleSortChange = (e) => setFilters({ ...filters, sort: e.target.value });
    const handleShowMissedChange = (e) => setFilters({ ...filters, showMissedOnly: e.target.checked });
    const clearFilters = () => {
        setHasActiveFilters(false)
        setFilters({ tags: [], sort: 'newest', showMissedOnly: false })
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Filters</h3>
                <div className="mb-4">
                    <label className="font-semibold mb-2 block">Event Type</label>
                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <button key={tag} onClick={() => handleTagChange(tag)} className={`px-3 py-1 text-sm rounded-full border transition-colors ${filters.tags.includes(tag) ? 'bg-green-600 border-green-600 text-white' : 'bg-neutral-700 border-neutral-600 hover:bg-neutral-600'}`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'Completed' && (
                    <>
                        <div className="mb-4">
                            <label htmlFor="sort" className="font-semibold mb-2 block">Sort by</label>
                            <select id="sort" value={filters.sort} onChange={handleSortChange} className="w-full bg-neutral-700 border-neutral-600 rounded-md p-2">
                                <option value="newest">Date (Newest First)</option>
                                <option value="oldest">Date (Oldest First)</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="show-missed" checked={filters.showMissedOnly} onChange={handleShowMissedChange} className="h-4 w-4 rounded bg-neutral-700 border-neutral-600 text-green-600 focus:ring-green-500" />
                            <label htmlFor="show-missed" className="ml-2">Show only missed events</label>
                        </div>
                    </>
                )}

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={clearFilters} className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 rounded-md">Clear</button>
                    <button onClick={onClose} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md">Apply</button>
                </div>
            </div>
        </div>
    );
};

FilterModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    filters: PropTypes.shape({
        tags: PropTypes.arrayOf(PropTypes.string).isRequired,
        sort: PropTypes.string.isRequired,
        showMissedOnly: PropTypes.bool.isRequired,
    }).isRequired,
    setFilters: PropTypes.func.isRequired,
    activeTab: PropTypes.string.isRequired,
    hasActiveFilters: PropTypes.bool,
    setHasActiveFilters: PropTypes.func.isRequired
};

export default FilterModal
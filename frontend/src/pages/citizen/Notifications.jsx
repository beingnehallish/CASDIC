// export default function Notifications({ data, watchlist }) {
//   return (
//     <div className="notifications-grid">
//       <div className="watchlist-column">
//         <h3>Your Watchlist</h3>
//         {watchlist.size ? (
//           Array.from(watchlist).map(([key, name]) => (
//             <div key={key} className="watchlist-item">
//               {name}
//             </div>
//           ))
//         ) : (
//           <p>No items in watchlist</p>
//         )}
//       </div>

//       <div className="notifications-column">
//         <h3>Notifications</h3>
//         {data.length ? (
//           data
//             .filter((notif) => watchlist.has(notif.item_id))
//             .map((notif) => (
//               <div key={notif.notification_id} className="notification-item">
//                 <p>{notif.message}</p>
//                 <p>
//                   <small>{new Date(notif.created_at).toLocaleString()}</small>
//                 </p>
//               </div>
//             ))
//         ) : (
//           <p>No notifications yet</p>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { FaSearch, FaTimes, FaChevronDown, FaChevronRight } from "react-icons/fa";
import "../../styles/Charts.css"; // We will add styles to this file

// Helper function to segregate the watchlist
const segregateWatchlist = (watchlistMap) => {
  const segregated = {
    tech: [],
    project: [],
    patent: [],
    pub: [],
  };

  for (const [key, name] of watchlistMap.entries()) {
    const [type, id] = key.split("-");
    if (segregated[type]) {
      segregated[type].push({ id, name, key });
    }
  }
  return segregated;
};

// Helper component for the accordion item
const WatchlistItem = ({ item, type, handleViewDetails, handleToggleWatchlist }) => (
  <div className="watchlist-item">
    <span className="item-info">{item.name}</span>
    <span className="item-actions">
      <FaSearch
        className="icon"
        title="View Details"
        onClick={() => {
          // We pass a minimal item object for navigation
          const itemObject = { [`${type}_id`]: item.id };
          handleViewDetails(itemObject, type);
        }}
      />
      <FaTimes
        className="icon delete-icon"
        title="Remove from Watchlist"
        onClick={() => handleToggleWatchlist(type, item.id, item.name)}
      />
    </span>
  </div>
);

// --- Main Notifications Component ---
export default function Notifications({
  data,
  watchlist,
  handleViewDetails,
  handleToggleWatchlist
}) {
  const [openSection, setOpenSection] = useState("tech"); // Default open section
  const segregatedList = segregateWatchlist(watchlist);

  const sections = [
    { key: "tech", title: "Technologies", data: segregatedList.tech },
    { key: "project", title: "Projects", data: segregatedList.project },
    { key: "patent", title: "Patents", data: segregatedList.patent },
    { key: "pub", title: "Publications", data: segregatedList.pub },
  ];

  return (
    <div className="notifications-layout">
      {/* --- Left Column: Segregated Watchlist --- */}
      <div className="watchlist-panel chart-card">
        <h3>My Watchlist</h3>
        {sections.map(section => (
          <div key={section.key} className="accordion-section">
            <div
              className="accordion-header"
              onClick={() => setOpenSection(openSection === section.key ? null : section.key)}
            >
              <h4>{section.title} ({section.data.length})</h4>
              {openSection === section.key ? <FaChevronDown /> : <FaChevronRight />}
            </div>
            {openSection === section.key && (
              <div className="accordion-content">
                {section.data.length > 0 ? (
                  section.data.map(item => (
                    <WatchlistItem
                      key={item.key}
                      item={item}
                      type={section.key}
                      handleViewDetails={handleViewDetails}
                      handleToggleWatchlist={handleToggleWatchlist}
                    />
                  ))
                ) : (
                  <p className="empty-section-text">No items in this section.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- Right Column: Notification Feed --- */}
      <div className="notifications-feed chart-card">
        <h3>Notification Feed</h3>
        <div className="notifications-list">
          {data.length > 0 ? (
            data
              .filter((notif) => watchlist.has(notif.item_id)) // This logic is from your old file
              .map((notif) => (
                <div key={notif.notification_id} className="notification-item">
                  <p>{notif.message}</p>
                  <p>
                    <small>{new Date(notif.created_at).toLocaleString()}</small>
                  </p>
                </div>
              ))
          ) : (
            <p className="empty-section-text">No notifications yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
/**
 * Initialize test data for rating system
 * Call this in useEffect of App.jsx to populate sample reviews
 */
export const initTestReviewData = () => {
    // Get existing reviews or empty array
    const existingReviews = JSON.parse(localStorage.getItem('productReviews')) || [];
    
    // Only add test data if no reviews exist yet
    if (existingReviews.length > 0) {
        console.log('Test reviews already exist, skipping initialization');
        return;
    }

    const testReviews = [
        {
            id: 1000,
            user_id: 1,
            product_id: 1,
            rating: 5,
            comment: "MacBook Air M1 này thực sự tuyệt vời! Hiệu năng mạnh, pin trâu, rất hài lòng với sản phẩm.",
            created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString()
        },
        {
            id: 1001,
            user_id: 2,
            product_id: 1,
            rating: 4,
            comment: "Sản phẩm tốt nhưng giá hơi cao một chút. Chất lượng xứng đáng với giá tiền.",
            created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString()
        },
        {
            id: 1002,
            user_id: 3,
            product_id: 1,
            rating: 5,
            comment: "Rất hài lòng! Giao hàng nhanh, sản phẩm đúng như mô tả.",
            created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
        },
        {
            id: 1003,
            user_id: 4,
            product_id: 2,
            rating: 5,
            comment: "VGA RTX 4060 Ti này quá tuyệt! Chơi game 1440p mượt lắm.",
            created_at: new Date(Date.now() - 10*24*60*60*1000).toISOString()
        },
        {
            id: 1004,
            user_id: 5,
            product_id: 2,
            rating: 4,
            comment: "Hiệu năng tốt, nhưng tiêu thụ điện hơi cao. Vẫn ok được.",
            created_at: new Date(Date.now() - 8*24*60*60*1000).toISOString()
        },
        {
            id: 1005,
            user_id: 1,
            product_id: 3,
            rating: 5,
            comment: "RAM Corsair chất lượng cao, chạy ổn định.",
            created_at: new Date(Date.now() - 15*24*60*60*1000).toISOString()
        },
        {
            id: 1006,
            user_id: 2,
            product_id: 4,
            rating: 5,
            comment: "Asus ROG Strix G15 là chiếc laptop gaming tuyệt nhất mà tôi từng dùng!",
            created_at: new Date(Date.now() - 20*24*60*60*1000).toISOString()
        },
        {
            id: 1007,
            user_id: 3,
            product_id: 5,
            rating: 5,
            comment: "MacBook Pro M3 14 inch thực sự là một chiếc máy chuyên nghiệp hoàn hảo. Giá mắc nhưng xứng đáng.",
            created_at: new Date(Date.now() - 25*24*60*60*1000).toISOString()
        }
    ];

    localStorage.setItem('productReviews', JSON.stringify(testReviews));
    console.log('Test reviews initialized:', testReviews.length, 'reviews added');
};

/**
 * Clear all test data
 */
export const clearTestReviewData = () => {
    localStorage.removeItem('productReviews');
    console.log('All reviews cleared');
};

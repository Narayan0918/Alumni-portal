import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import API from '../api/axios';

export default function FeedScreen() {
    const [feed, setFeed] = useState({ stories: [], events: [], jobs: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await API.get('/feed');
                setFeed(res.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /></View>;

    const Section = ({ title, data, renderItem, emptyText, color }) => (
        <View style={[styles.card, { borderTopColor: color }]}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {data.length === 0 ? <Text style={styles.empty}>{emptyText}</Text> : data.map(renderItem)}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.collegeName}>Govt. Engineering College</Text>
                <Text style={styles.welcome}>Welcome back!</Text>
            </View>

            {/* Stories */}
            <Section 
                title="🌟 Inspiring Stories" 
                color="#FBBF24" // Yellow
                data={feed.stories} 
                emptyText="No stories yet."
                renderItem={(item) => (
                    <View key={item.story_id} style={styles.item}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemSub}>{item.author}</Text>
                    </View>
                )}
            />

            {/* Events */}
            <Section 
                title="📅 Upcoming Events" 
                color="#10B981" // Green
                data={feed.events} 
                emptyText="No upcoming events."
                renderItem={(item) => (
                    <View key={item.event_id} style={styles.item}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemSub}>{new Date(item.event_date).toDateString()}</Text>
                    </View>
                )}
            />

            {/* Jobs */}
            <Section 
                title="💼 Latest Jobs" 
                color="#8B5CF6" // Purple
                data={feed.jobs} 
                emptyText="No job postings."
                renderItem={(item) => (
                    <View key={item.job_id} style={styles.item}>
                        <Text style={styles.itemTitle}>{item.job_title}</Text>
                        <Text style={styles.itemSub}>{item.company_name} • {item.job_type}</Text>
                    </View>
                )}
            />
            
            <View style={{height: 20}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#1e3a8a', padding: 20, paddingBottom: 30 },
    collegeName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    welcome: { color: '#bfdbfe', fontSize: 14, marginTop: 5 },
    card: { backgroundColor: 'white', margin: 15, marginTop: 0, padding: 15, borderRadius: 10, borderTopWidth: 4, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#1f2937' },
    item: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10 },
    itemTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
    itemSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    empty: { color: '#9ca3af', fontStyle: 'italic' }
});